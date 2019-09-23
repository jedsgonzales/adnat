class ShiftCreationHandler
  include ActiveModel::Validations
  include ActiveModel::Callbacks

  define_model_callbacks :initialize, only: [:after]
  after_initialize :all_valid?

  define_model_callbacks :create_shift, only: [:before]
  before_create_shift :build_timestamps

  define_model_callbacks :build_timestamps, only: [:after]
  after_build_timestamps :calculate_shift

  validates_with ShiftValidator

  validates :user, presence: true
  validates :organization, presence: true

  attr_reader :user, :organization, :shift, :params

  def self.execute(params, user, shift_id = nil)
    self.new(params, user, shift_id).tap(&:create_shift)
  end

  def initialize(req_params, user, shift_id = nil)
    run_callbacks :initialize do
      @params = req_params

      @shift = shift_id.nil? ? Shift.new : Shift.find_by_id(shift_id)
      @shift.assign_attributes(permitted_shift_attributes)
      @shift.user = @user = user
      @shift.organization = @organization = Organization.find_by_id(
        req_params[:organization_id].present? ? req_params[:organization_id] :
        (req_params[:shift][:organization_id].present? ? req_params[:shift][:organization_id] : 0) )
    end
  end

  def success?
    shift.errors.size == 0 && errors.size == 0 && shift.persisted?
  end

  def all_valid?
    if shift.valid?
      build_timestamps

      valid?
    else
      false
    end
  end

  def build_timestamps
    run_callbacks :build_timestamps do
      shift.start_time = Time.zone.parse("#{shift.shift_date} #{shift.start_time_val}:00")
      shift.end_time = Time.zone.parse("#{shift.shift_date} #{shift.end_time_val}:00")

      if shift.end_time < shift.start_time
        shift.end_time = shift.end_time + 1.day
      end
    end
  end

  def calculate_shift
    if shift.start_time.day == shift.end_time.day
      worked = ((shift.end_time - shift.start_time).to_i / 60) - shift.total_breaks # in minutes

      shift.total_worked = worked
      shift.shift_cost = calculate_cost(shift.organization, worked, shift.start_time.sunday?)

    else
      # Applies: 4. Overnight shifts (medium)
      day1_worked = (shift.start_time.end_of_day - shift.start_time).to_i / 60 # in minutes
      day2_worked = ((shift.end_time - shift.end_time.beginning_of_day).to_i / 60)  - shift.total_breaks # in minutes

      if day2_worked < 0
        day1_worked = day1_worked + day2_worked
        day2_worked = 0
      end

      shift.total_worked = day1_worked + day2_worked
      shift.shift_cost = calculate_cost(shift.organization, day1_worked, shift.start_time.sunday?) + calculate_cost(shift.organization, day2_worked, shift.end_time.sunday?)

    end

    def result
      res = { success: success? }

      if res[:success]
        res[:status] = :created # 201 # created
        res[:response] = { message: 'Shift saved successfully.' }
      else
        res[:status] = :unprocessable_entity # 422 # unprocessable entity
        res[:response] = { message: 'Invalid entry.', errors: errors.full_messages.collect{ |message| message } + shift.errors.full_messages.collect{ |message| message } }
      end

      res
    end
  end

  def create_shift
    run_callbacks :create_shift do
      success = true if shift.save
    end
  end

  private
  # Calculate cost per hour
  # Applies: 5. Penalty rates on Sundays (medium)
  def calculate_cost(organization, worked_in_minutes, is_sunday)
    organization.hourly_rate * (is_sunday ? 2 : 1) * (worked_in_minutes / 60)
  end

  def permitted_shift_attributes
    params.permit(:organization_id, :shift_date, :start_time_val, :end_time_val, :breaks => [])
  end

end
