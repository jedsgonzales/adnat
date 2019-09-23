class Api::ShiftsController < ApplicationController

  def index
    if params[:organization_id].present?
      shifts = Organization.find(params[:organization_id]).shifts
    elsif params[:user_id].present?
      shifts = User.find(params[:user_id]).shifts
    else
      shifts = Shift.order(start_time: :desc)
    end

    render json: shifts.to_json(:include => {
        :user => { :except => :password },
        :organization => {} },
      methods: [:start_time_val, :end_time_val, :shift_date],
      except: [:start_time, :end_time])
  end

  def show
    render json: Shift.find(params[:id]), serializer: ShiftSerializer
  end

  def create
    handler = ShiftCreationHandler.execute(params, (params[:user_id].present? ? User.find_by_id(params[:user_id]) : @user) )

    render json: handler.result[:response].to_json, status: handler.result[:status]
  end

  def update
    handler = ShiftCreationHandler.execute(params, (params[:user_id].present? ? User.find_by_id(params[:user_id]) : @user), params[:id])
    render json: handler.result[:response].to_json, status: handler.result[:status]
  end

  def destroy
    shift = Shift.find(params[:id])
    shift.destroy

    render json: shift.to_json(:include => {
        :user => { :except => :password },
        :organization => {} },
      methods: [:start_time_val, :end_time_val, :shift_date],
      except: [:start_time, :end_time])
  end

end
