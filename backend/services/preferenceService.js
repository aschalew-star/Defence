/**
 * User Notification Preference Service
 * Manages multi-channel (In-App, Email, SMS) delivery rules per notification type.
 */

const DEFAULT_PREFERENCES = {
  channels: {
    inApp: true,
    email: true,
    sms: true,
  },
  categories: {
    orderUpdates: {
      inApp: true,
      email: true,
      sms: true,
    },
    artisanUpdates: {
      inApp: true,
      email: true,
      sms: false, // SMS off by default for artisan follower alerts to prevent high carrier frequency
    },
    promotionsDeals: {
      inApp: true,
      email: true,
      sms: false,
    },
    disputesReturns: {
      inApp: true,
      email: true,
      sms: true,
    },
    accountSecurity: {
      inApp: true,
      email: true,
      sms: false,
    },
  },
  // Legacy backward-compatibility flags
  email: true,
  orderUpdates: true,
  promotions: true,
  priceDrop: true,
};

/**
 * Merge stored user preferences with full defaults structure
 * @param {Object} rawPrefs - Raw user.notificationPreferences
 * @returns {Object} normalized preferences object
 */
const normalizePreferences = (rawPrefs = {}) => {
  if (!rawPrefs) return { ...DEFAULT_PREFERENCES };

  const channels = {
    inApp: rawPrefs.channels?.inApp !== undefined ? Boolean(rawPrefs.channels.inApp) : DEFAULT_PREFERENCES.channels.inApp,
    email: rawPrefs.channels?.email !== undefined ? Boolean(rawPrefs.channels.email) : (rawPrefs.email !== undefined ? Boolean(rawPrefs.email) : DEFAULT_PREFERENCES.channels.email),
    sms: rawPrefs.channels?.sms !== undefined ? Boolean(rawPrefs.channels.sms) : DEFAULT_PREFERENCES.channels.sms,
  };

  const categories = {
    orderUpdates: {
      inApp: rawPrefs.categories?.orderUpdates?.inApp !== undefined ? Boolean(rawPrefs.categories.orderUpdates.inApp) : DEFAULT_PREFERENCES.categories.orderUpdates.inApp,
      email: rawPrefs.categories?.orderUpdates?.email !== undefined ? Boolean(rawPrefs.categories.orderUpdates.email) : (rawPrefs.orderUpdates !== undefined ? Boolean(rawPrefs.orderUpdates) : DEFAULT_PREFERENCES.categories.orderUpdates.email),
      sms: rawPrefs.categories?.orderUpdates?.sms !== undefined ? Boolean(rawPrefs.categories.orderUpdates.sms) : DEFAULT_PREFERENCES.categories.orderUpdates.sms,
    },
    artisanUpdates: {
      inApp: rawPrefs.categories?.artisanUpdates?.inApp !== undefined ? Boolean(rawPrefs.categories.artisanUpdates.inApp) : DEFAULT_PREFERENCES.categories.artisanUpdates.inApp,
      email: rawPrefs.categories?.artisanUpdates?.email !== undefined ? Boolean(rawPrefs.categories.artisanUpdates.email) : DEFAULT_PREFERENCES.categories.artisanUpdates.email,
      sms: rawPrefs.categories?.artisanUpdates?.sms !== undefined ? Boolean(rawPrefs.categories.artisanUpdates.sms) : DEFAULT_PREFERENCES.categories.artisanUpdates.sms,
    },
    promotionsDeals: {
      inApp: rawPrefs.categories?.promotionsDeals?.inApp !== undefined ? Boolean(rawPrefs.categories.promotionsDeals.inApp) : DEFAULT_PREFERENCES.categories.promotionsDeals.inApp,
      email: rawPrefs.categories?.promotionsDeals?.email !== undefined ? Boolean(rawPrefs.categories.promotionsDeals.email) : (rawPrefs.promotions !== undefined ? Boolean(rawPrefs.promotions) : DEFAULT_PREFERENCES.categories.promotionsDeals.email),
      sms: rawPrefs.categories?.promotionsDeals?.sms !== undefined ? Boolean(rawPrefs.categories.promotionsDeals.sms) : DEFAULT_PREFERENCES.categories.promotionsDeals.sms,
    },
    disputesReturns: {
      inApp: rawPrefs.categories?.disputesReturns?.inApp !== undefined ? Boolean(rawPrefs.categories.disputesReturns.inApp) : DEFAULT_PREFERENCES.categories.disputesReturns.inApp,
      email: rawPrefs.categories?.disputesReturns?.email !== undefined ? Boolean(rawPrefs.categories.disputesReturns.email) : DEFAULT_PREFERENCES.categories.disputesReturns.email,
      sms: rawPrefs.categories?.disputesReturns?.sms !== undefined ? Boolean(rawPrefs.categories.disputesReturns.sms) : DEFAULT_PREFERENCES.categories.disputesReturns.sms,
    },
    accountSecurity: {
      inApp: rawPrefs.categories?.accountSecurity?.inApp !== undefined ? Boolean(rawPrefs.categories.accountSecurity.inApp) : DEFAULT_PREFERENCES.categories.accountSecurity.inApp,
      email: rawPrefs.categories?.accountSecurity?.email !== undefined ? Boolean(rawPrefs.categories.accountSecurity.email) : DEFAULT_PREFERENCES.categories.accountSecurity.email,
      sms: rawPrefs.categories?.accountSecurity?.sms !== undefined ? Boolean(rawPrefs.categories.accountSecurity.sms) : DEFAULT_PREFERENCES.categories.accountSecurity.sms,
    },
  };

  return {
    channels,
    categories,
    email: channels.email,
    orderUpdates: categories.orderUpdates.email,
    promotions: categories.promotionsDeals.email,
    priceDrop: rawPrefs.priceDrop !== undefined ? Boolean(rawPrefs.priceDrop) : true,
  };
};

/**
 * Check if a notification should be delivered to the user
 * @param {Object} user - User document
 * @param {string} category - "orderUpdates" | "artisanUpdates" | "promotionsDeals" | "disputesReturns" | "accountSecurity"
 * @param {string} channel - "inApp" | "email" | "sms"
 * @returns {boolean}
 */
const shouldNotify = (user, category = "orderUpdates", channel = "inApp") => {
  if (!user) return true;
  const prefs = normalizePreferences(user.notificationPreferences);

  // 1. Master channel switch
  if (prefs.channels[channel] === false) {
    return false;
  }

  // 2. Category-channel switch
  if (prefs.categories[category] && prefs.categories[category][channel] !== undefined) {
    return Boolean(prefs.categories[category][channel]);
  }

  return true;
};

module.exports = {
  DEFAULT_PREFERENCES,
  normalizePreferences,
  shouldNotify,
};
