class ShiftValidator < ActiveModel::Validator
  def validate(shift_creator)
    validate_worked_hours_vs_breaks(shift_creator)
  end

  def validate_worked_hours_vs_breaks(shift_creator)
    shift = shift_creator.shift

    shift.total_breaks = shift.breaks.inject(0){|sum,x| sum + x } #in minutes

    total_worked = (shift.end_time - shift.start_time).to_i / 60 # seconds / 60 = n minutes

    shift_creator.errors.add(:base, "you can't take more breaks than you have worked for -- #{ (shift.total_breaks/60).round(2) } hour(s) break / #{ (total_worked/60).round(2) } hours worked") if shift.total_breaks > total_worked
  end
end
