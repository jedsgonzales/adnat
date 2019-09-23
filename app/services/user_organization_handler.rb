class UserOrganizationHandler
  include ActiveModel::Validations
  include ActiveModel::Callbacks
  include ActiveModel::Serialization

  validates :user, presence: true

  attr_accessor :user, :organization_mapping

  def self.execute(api_user)
    self.new(api_user)
  end

  def initialize(api_user)
    @user = api_user
    @organization_mapping = []
    Organization.order(:name).each do |org|
      @organization_mapping << { organization: org.as_json, member: org.has_member?(@user.id) }
    end
  end

end
