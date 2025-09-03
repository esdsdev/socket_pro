export default (sequelize, DataTypes) => {
  const UserSettings = sequelize.define('UserSettings', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    read_receipts_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    online_status_visible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    typing_indicators_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notifications_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sound_alerts_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    auto_download_media: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    max_auto_download_size: {
      type: DataTypes.INTEGER,
      defaultValue: 10, // MB
      comment: 'Maximum file size for auto-download in MB'
    },
    theme: {
      type: DataTypes.ENUM('light', 'dark', 'system'),
      defaultValue: 'system'
    },
    chat_background: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL to custom chat background image'
    }
  }, {
    tableName: 'user_settings',
    indexes: [
      {
        unique: true,
        fields: ['user_id']
      }
    ]
  });

  return UserSettings;
};