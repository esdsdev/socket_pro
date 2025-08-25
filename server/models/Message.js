export default (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sender_id: {
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
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'voice', 'file'),
      defaultValue: 'text',
      allowNull: false
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_for_everyone: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    edited_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'messages',
    indexes: [
      {
        fields: ['sender_id']
      },
      {
        fields: ['receiver_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['sender_id', 'receiver_id']
      }
    ]
  });

  return Message;
};