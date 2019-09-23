class Shift < ApplicationRecord
  serialize :breaks, Array

  belongs_to :user
  belongs_to :organization

  attr_writer :start_time_val, :end_time_val, :shift_date

  validates :shift_date, presence: true, format: { with: /([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/, message: 'invalid date format, use YYYY-mm-dd' }
  validates :start_time_val, presence: true, format: { with: /(([0-1][0-9])|(2[0-3])):[0-5][0-9]/, message: 'invalid time format, use HH:MM' }
  validates :end_time_val, presence: true, format: { with: /(([0-1][0-9])|(2[0-3])):[0-5][0-9]/, message: 'invalid time format, use HH:MM' }

  def start_time_val
    @start_time_val.present? ? @start_time_val : (start_time.present? ? start_time : (Time.zone.now - 1.hour)).strftime('%H:%M')
  end

  def end_time_val
    @end_time_val.present? ? @end_time_val : (end_time.present? ? end_time : Time.zone.now).strftime('%H:%M')
  end

  def shift_date
    @shift_date.present? ? @shift_date : (start_time.present? ? start_time : Time.zone.now).strftime('%Y-%m-%d')
  end
end
