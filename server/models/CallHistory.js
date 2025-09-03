export default (sequelize, DataTypes) => {
  const CallHistory = sequelize.define('CallHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    caller_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    receiver_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    call_type: {
      type: DataTypes.ENUM('voice', 'video'),
      allowNull: false
    },
    call_status: {
      type: DataTypes.ENUM('missed', 'answered', 'declined', 'busy'),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Duration in seconds'
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    ended_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'call_history',
    indexes: [
      {
        fields: ['caller_id']
      },
      {
        fields: ['receiver_id']
      },
      {
        fields: ['started_at']
      }
    ]
  });

  return CallHistory;
};