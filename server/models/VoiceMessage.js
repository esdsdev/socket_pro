export default (sequelize, DataTypes) => {
  const VoiceMessage = sequelize.define('VoiceMessage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    message_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'messages',
        key: 'id'
      }
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    public_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    format: {
      type: DataTypes.STRING(10),
      defaultValue: 'webm'
    }
  }, {
    tableName: 'voice_messages',
    indexes: [
      {
        fields: ['message_id']
      },
      {
        fields: ['public_id']
      }
    ]
  });

  return VoiceMessage;
};