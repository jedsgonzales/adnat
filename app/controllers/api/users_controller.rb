class Api::UsersController < ApplicationController

  skip_before_action :login_filter, only: [:login, :authenticate, :password_reset, :create]

  def login
    respond_to do |format|
      format.json do
        self.status = :unauthorized
        self.response_body = { message: 'Authorization required.' }.to_json
      end
    end
  end

  def authenticate
    handler = LoginHandler.execute(params)
    render json: handler.result[:response].to_json, status: handler.result[:status]
  end

  def auth_by_token
    handler = TokenAuthHandler.execute(request.headers['Authorization'])
    render json: handler.result[:response].to_json, status: handler.result[:status]
  end

  def dashboard
    render json: @user, serializer: UserSerializer
  end

  def create
    handler = SignupHandler.execute(params)
    render json: handler.result[:response].to_json, status: handler.result[:status]
  end

  # collection
  def password_reset
    handler = PasswordResetHandler.execute(params)
    render json: handler.result[:response].to_json, status: handler.result[:status]
  end

end
