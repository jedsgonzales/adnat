class ShiftSerializer < ActiveModel::Serializer
  attributes :id, :start_time_val, :end_time_val, :shift_date,  :breaks, :total_breaks, :total_worked, :shift_cost

  has_one user.as_json(except: :password)
  has_one organization

end
