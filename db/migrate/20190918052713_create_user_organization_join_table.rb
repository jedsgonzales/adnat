class CreateUserOrganizationJoinTable < ActiveRecord::Migration[5.2]
  def change
    create_join_table :organizations, :users
  end
end
