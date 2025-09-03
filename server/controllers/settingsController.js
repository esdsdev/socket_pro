import { UserSettings } from '../models/index.js';

class SettingsController {
  // Get user settings
  async getUserSettings(req, res, next) {
    try {
      const userId = req.user.id;

      let settings = await UserSettings.findOne({
        where: { user_id: userId }
      });

      // Create default settings if they don't exist
      if (!settings) {
        settings = await UserSettings.create({
          user_id: userId
        });
      }

      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  // Update user settings
  async updateUserSettings(req, res, next) {
    try {
      const userId = req.user.id;
      const settingsData = req.body;

      let settings = await UserSettings.findOne({
        where: { user_id: userId }
      });

      if (!settings) {
        // Create new settings
        settings = await UserSettings.create({
          user_id: userId,
          ...settingsData
        });
      } else {
        // Update existing settings
        await settings.update(settingsData);
      }

      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  // Update specific setting
  async updateSetting(req, res, next) {
    try {
      const userId = req.user.id;
      const { setting, value } = req.body;

      let settings = await UserSettings.findOne({
        where: { user_id: userId }
      });

      if (!settings) {
        settings = await UserSettings.create({
          user_id: userId,
          [setting]: value
        });
      } else {
        await settings.update({ [setting]: value });
      }

      res.json({ message: 'Setting updated successfully', settings });
    } catch (error) {
      next(error);
    }
  }
}

export default new SettingsController();