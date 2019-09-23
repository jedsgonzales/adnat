class SignupHandler
  include ActiveModel::Validations
  include ActiveModel::Callbacks

  validates :email, presence: true
  validates :password, presence: true, confirmation: true
  validates :password_confirmation, presence: true

  attr_accessor :user, :params, :name, :email, :password, :password_confirmation

  define_model_callbacks :initialize, only: [:after]
  after_initialize :valid?

  def self.execute(params)
    self.new(params).tap(&:create_user)
  end

  def initialize(req_params)
    run_callbacks :initialize do
      @params = req_params
      @name = req_params[:name]
      @email = req_params[:email]
      @password = req_params[:password]
      @password_confirmation = req_params[:password_confirmation]
    end
  end

  def result
    res = { success: success? }

    if res[:success]
      res[:status] = :created # 201 # created
      res[:response] = { message: 'Signup Successful.' }
    else
      res[:status] = :unprocessable_entity # 422 # unprocessable entity
      res[:response] = { message: 'Invalid entry.', errors: errors.full_messages.collect{ |message| message } + user.errors.full_messages.collect{ |message| message } }
    end

    res
  end

  def create_user
    @user = User.create(permitted_signup_attributes)
  end

  def success?
    errors.size == 0 && user.errors.size == 0 && user.present? && user.persisted?
  end

  private
  def permitted_signup_attributes
    params.require(:user).permit(:name, :email, :password)
  end
end
