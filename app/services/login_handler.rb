class LoginHandler
  include ActiveModel::Validations
  include ActiveModel::Callbacks
  include ActiveModel::Serialization

  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP, message: 'is not a valid email format' }
  validates :password, presence: true
  validates :user, presence: { message: 'account not found' }

  attr_accessor :email, :password, :user, :user_token

  define_model_callbacks :initialize, only: [:after]
  after_initialize :valid?

  def self.execute(params)
    self.new(params).tap(&:create_token)
  end

  def initialize(req_params)
    run_callbacks :initialize do
      @email = req_params[:email]
      @password = req_params[:pass]

      @user = User.where(email: @email, password: @password).first
    end
  end

  def result
    res = { success: success? }

    if res[:success]
      res[:status] = :accepted # 202 # accepted
      res[:response] = { message: 'Login accepted.', token: user_token.token, user: user.as_json({ except: :password, include: :organizations}) }
    else
      res[:status] = :not_acceptable # 406 # not acceptable
      res[:response] = { message: 'Invalid credentials.', errors: errors.full_messages.collect{ |message| message }  }
    end

    res
  end

  def success?
    errors.size == 0 && user_token.present? && user_token.persisted?
  end

  def create_token
    @user_token = UserToken.create(user: user, token: Digest::SHA2.hexdigest(Time.now.to_s), expiry: Time.now + 30.minutes )
  end
end
