class OrganizationHandler
  include ActiveModel::Validations
  include ActiveModel::Callbacks

  attr_accessor :organization, :user

  define_model_callbacks :initialize, only: [:after]

  def self.execute(params)
    self.new(params).tap(&:save_organization)
  end

  def initialize(req_params)
    run_callbacks :initialize do
      if req_params[:user_id].present?
        @user = User.find_by_id(req_params[:user_id])
      end

      if req_params[:id].present?
        @organization = Organization.find_by_id(req_params[:id])
      else
        @organization = Organization.new
      end

      @organization.name = req_params[:name]
      @organization.hourly_rate = req_params[:rate]
    end
  end

  def result
    res = { success: success? }

    if res[:success]
      res[:status] = :created # 201 # created
      res[:response] = { message: 'Organization created.' }
    else
      res[:status] = :unprocessable_entity # 422 # unprocessable entity
      res[:response] = { message: 'Errors found while creating organization.', errors: organization.errors.full_messages.collect{ |message| message } }
    end

    res
  end

  def save_organization
    organization.save
    organization.users << user if user.present?
  end

  def success?
    organization.errors.size == 0 && organization.persisted?
  end

  private
  def permitted_signup_attributes
    params.require(:user).permit(:name, :email, :password)
  end
end
