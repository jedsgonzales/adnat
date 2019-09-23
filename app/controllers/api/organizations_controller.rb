class Api::OrganizationsController < ApplicationController

  def index
    handler = UserOrganizationHandler.execute(@user)
    render json: handler.organization_mapping.to_json
  end

  def show
  end

  def new
  end

  def create
    handler = OrganizationHandler.execute(params)
    render json: handler.result[:response].to_json, status: handler.result[:status]
  end

  def edit
  end

  def update
    handler = OrganizationHandler.execute(params)
    render json: handler.result[:response].to_json, status: handler.result[:status]
  end

  def join
    handler = OrganizationMembershipHandler.execute(params, 'join')
    render json: handler.result[:response].to_json, status: handler.result[:status]
  end

  def leave
    handler = OrganizationMembershipHandler.execute(params, 'leave')
    render json: handler.result[:response].to_json, status: handler.result[:status]
  end

end
