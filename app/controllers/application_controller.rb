class ApplicationController < ActionController::Base

  protect_from_forgery with: :null_session
  
  before_action :login_filter

  def login_filter
    token = request.headers['Authorization']
    user_login = UserToken.where(token: token).where('expiry > ?', Time.now).take

    if token.blank? || user_login.nil?
      redirect_to login_api_users_path
    else
      user_login.update_attributes(expiry: user_login.expiry + 30.minutes)
      @user = user_login.user
    end
  end

end
