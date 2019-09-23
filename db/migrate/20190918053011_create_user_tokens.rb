class CreateUserTokens < ActiveRecord::Migration[5.2]
  def change
    create_table :user_tokens do |t|
      t.references :user
      t.string :token, length: 256, null: false
      t.timestamp :expiry, null: false

      t.timestamps
    end
  end
end
