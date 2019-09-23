class ShiftHandlerSerializer < ActiveModel::Serializer
  attributes :shift, :user, :organization
end
