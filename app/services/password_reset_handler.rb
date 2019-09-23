class PasswordResetHandler
  include ActiveModel::Validations
  include ActiveModel::Callbacks

  validates :user, presence: true

  attr_accessor :user

  define_model_callbacks :initialize, only: [:after]
  after_initialize :valid?

  def self.execute(params)
    self.new(params).tap(&:reset_password)
  end

  def initialize(req_params)
    run_callbacks :initialize do
      @user = User.find_by_email(req_params[:email])
    end
  end

  def result
    res = { success: success? }

    if res[:success]
      res[:status] = :ok # 200 # ok
      res[:response] = { message: "Password reset successful - #{user.password}" }
    else
      res[:status] = :expectation_failed # 417 # expectation failed
      res[:response] = { message: 'Account does not exists.' }
    end

    res
  end

  def success?
    errors.size == 0 && user.present?
  end

  def reset_password
    user.update_attribute(:password, generate_pass(8))
    # SendMailHandler.execute(user.email, 'Password Reset Request', 'Your password has been reset. Your new password is #{user.password}')
  end

  private
  def generate_pass(len)
    alpha_chars = ('0'..'9').to_a + ('a'..'z').to_a + ('A'..'Z').to_a
    (0..len).map{ alpha_chars[SecureRandom.random_number(alpha_chars.size)] }.join
  end
end
