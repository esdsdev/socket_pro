export default (sequelize, DataTypes) => {
  const BlockedUser = sequelize.define('BlockedUser', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    blocker_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    blocked_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'blocked_users',
    indexes: [
      {
        unique: true,
        fields: ['blocker_id', 'blocked_id']
      },
      {
        fields: ['blocker_id']
      },
      {
        fields: ['blocked_id']
      }
    ]
  });

  return BlockedUser;
};