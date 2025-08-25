export default (sequelize, DataTypes) => {
  const Image = sequelize.define('Image', {
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
      allowNull: true
    },
    is_viewed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    viewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_view_once: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'images',
    indexes: [
      {
        fields: ['message_id']
      },
      {
        fields: ['public_id']
      }
    ]
  });

  return Image;
};