class TokenAuthHandler
  include ActiveModel::Validations
  include ActiveModel::Callbacks
  include ActiveModel::Serialization

  validates :user, presence: { message: 'account not found' }

  attr_accessor :user, :user_token

  define_model_callbacks :initialize, only: [:after]
  after_initialize :valid?

  def self.execute(params)
    self.new(params)
  end

  def initialize(token)
    run_callbacks :initialize do
      @user_token = UserToken.where(token: token).where("expiry > ?", Time.now).take
      @user = @user_token.user if @user_token.present?
    end
  end

  def result
    res = { success: success? }

    if res[:success]
      res[:status] = :ok
      res[:response] = { message: "Welcome back #{user.name}", token: user_token.token, user: user.as_json({ except: :password, include: :organizations}) }
    else
      res[:status] = :gone
      res[:response] = { message: 'Session not found.' }
    end

    res
  end

  def success?
    user_token.present? && user.present?
  end

end
