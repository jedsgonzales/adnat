class StaticController < ApplicationController
  skip_before_action :login_filter

  def index
  end
end
