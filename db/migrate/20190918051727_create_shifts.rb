class CreateShifts < ActiveRecord::Migration[5.2]
  def change
    create_table :shifts do |t|
      t.references :user
      t.references :organization
      t.timestamp :start_time
      t.timestamp :end_time
      t.text  :breaks

      t.decimal :shift_cost, default: 0
      t.decimal :total_worked, default: 0
      t.decimal :total_breaks, default: 0

      t.timestamps
    end
  end
end
