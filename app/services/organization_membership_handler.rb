class OrganizationMembershipHandler
  include ActiveModel::Validations
  include ActiveModel::Callbacks

  validates :organization, presence: true
  validates :user, presence: true

  attr_accessor :organization, :user, :membership_action

  define_model_callbacks :initialize, only: [:after]
  after_initialize :valid?

  def self.execute(params, act)
    self.new(params, act).tap(&:do_action)
  end

  def initialize(req_params, act)
    run_callbacks :initialize do
      @user = User.find_by_id(req_params[:user_id])
      @organization = Organization.find_by_id(req_params[:id])

      @membership_action = act
    end
  end

  def result
    res = { success: success? }

    if res[:success]
      res[:status] = :ok # 201 # created
      res[:response] = { message: 'Organization action performed.' }
    else
      res[:status] = :unprocessable_entity # 422 # unprocessable entity
      res[:response] = { message: 'Errors found while performing organization action.', errors: errors.full_messages.collect{ |message| message } + organization.errors.full_messages.collect{ |message| message } }
    end

    res
  end

  def do_action
    if membership_action == 'join'
      organization.users << user unless organization.users.exists?(user.id)
    else
      organization.users.delete(user) if organization.users.exists?(user.id)
    end
  end

  def success?
    organization.errors.size == 0
  end

end
