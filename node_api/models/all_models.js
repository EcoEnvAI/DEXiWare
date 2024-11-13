var exports = module.exports = {}

// *** model for user and user connected models ***

// User_roles model
exports.user_roles = function (sequelize, Sequelize) {

  // Model definition
  var User_roles = sequelize.define('User_roles', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    role_name: {
      type: Sequelize.STRING,
      notEmpty: true
    }

  }, {
    timestamps: false
  });
  return User_roles
}

// Users model
exports.users = function (sequelize, Sequelize) {

  // importing so we can make relations
  var User_roles = exports.user_roles(sequelize, Sequelize)

  // Model Definition
  var Users = sequelize.define('Users', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    firstname: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    lastname: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    email: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    phone: {
      type: Sequelize.STRING
    },

    company: {
      type: Sequelize.STRING
    },

    companyRole: {
      type: Sequelize.STRING
    },

    createdAt: {
      type: Sequelize.DATE,
      notEmpty: true
    },

    username: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    password: {
      type: Sequelize.STRING,
      allowNull: false
    },

    lastLogin: {
      type: Sequelize.DATE,
      default: Date.now
    }

  }, {
    timestamps: false
  });

  // *** Relations ***
  // 1 User_roles has many Users
  User_roles.hasMany(Users, { foreignKey: 'role' });
  Users.belongsTo(User_roles, { foreignKey: 'role' });

  return Users;
}

// User indicator privileges model
exports.user_indicator_privileges = function (sequelize, Sequelize) {

  // model definition
  var User_indicator_privileges = sequelize.define('User_indicator_privileges', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    role: {
      type: Sequelize.STRING,
      notEmpty: true
    }

  }, {
    timestamps: false
  });

  return User_indicator_privileges
}

// Nodes model
exports.nodes = function (sequelize, Sequelize) {

  // model definition
  var Nodes = sequelize.define('Nodes', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      type: Sequelize.STRING,
      notEmpty: true
    }
  }, {
    timestamps: false
  });
  return Nodes
}

// Node descriptions model
exports.node_descriptions = function (sequelize, Sequelize) {

  // importing so we can make relations
  var Nodes = exports.nodes(sequelize, Sequelize);

  // model definition
  var Node_descriptions = sequelize.define('Node_descriptions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    node_id: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    language: {
      type: Sequelize.STRING,
      notEmpty: true
    },
    name: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    description: {
      type: Sequelize.TEXT,
    }

  }, {
    timestamps: false
  });

  // *** Relations ***
  // 1 Nodes has many Node_descriptions
  Nodes.hasMany(Node_descriptions, { foreignKey: 'node_id' });
  Node_descriptions.belongsTo(Nodes, { foreignKey: 'node_id' });

  return Node_descriptions
}

// Pillar descriptions model
exports.pillar_descriptions = function (sequelize, Sequelize) {

  // model definition
  var Pillar_descriptions = sequelize.define('Pillar_descriptions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    pillar_id: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    language: {
      type: Sequelize.STRING,
      notEmpty: true
    },
    name: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    description: {
      type: Sequelize.TEXT,

    }

  }, {
    timestamps: false
  });

  // *** Relations ***
  // 1 pillars has many pillar_descriptions

  return Pillar_descriptions
}

// Pillars model
exports.pillars = function (sequelize, Sequelize) {

  // importing so we can make relations
  var Pillar_descriptions = exports.pillar_descriptions(sequelize, Sequelize);

  // model definition
  var Pillars = sequelize.define('Pillars', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    color: {
      type: Sequelize.STRING,

    },

    icon: {
      type: Sequelize.STRING,

    },

    model: {
      type: Sequelize.STRING,

    }

  }, {
    timestamps: false
  });

  Pillars.hasMany(Pillar_descriptions, { foreignKey: 'pillar_id' });
  Pillar_descriptions.belongsTo(Pillars, { foreignKey: 'pillar_id' });

  return Pillars
}


// Themes model
exports.themes = function (sequelize, Sequelize) {

  // Model Definition
  var Themes = sequelize.define('Themes', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true

    },

    themeId: {
      type: Sequelize.INTEGER,
      notEmpty: false,
      allowNull: true
    }

  }, {
    timestamps: false
  });

  // *** Relations ***
  // 1 themes can have many Themes
  Themes.hasMany(Themes, { foreignKey: 'themeId' });
  Themes.belongsTo(Themes, { foreignKey: 'themeId' });

  return Themes
}

// Theme_descriptions model
exports.theme_descriptions = function (sequelize, Sequelize) {

  // Importing so we can make relations
  var Themes = exports.themes(sequelize, Sequelize);

  // Model definition
  var Theme_descriptions = sequelize.define('Theme_descriptions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    themeId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    language: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    name: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    description: {
      type: Sequelize.TEXT,
    }

  }, {
    timestamps: false
  });

  // *** Relations
  // 1 Theme has many Theme_descriptions
  Themes.hasMany(Theme_descriptions, { foreignKey: 'themeId' });
  Theme_descriptions.belongsTo(Themes, { foreignKey: 'themeId' });

  return Theme_descriptions
}

// Assesment types model needs to be here because of Indicators
exports.assesment_types = function (sequelize, Sequelize) {


  // Model Definition
  var Assesment_types = sequelize.define('Assesment_types', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    indicatorId: {
      type: Sequelize.INTEGER,
    }

  }, {
    timestamps: false
  });

  return Assesment_types
}

// Indicator_descriptions model
exports.indicator_descriptions = function (sequelize, Sequelize) {

  // Model Definition
  var Indicator_descriptions = sequelize.define('Indicator_descriptions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    indicatorId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    language: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    name: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    description: {
      type: Sequelize.TEXT,
    },

    metrics: {
      type: Sequelize.TEXT,

    }

  }, {
    timestamps: false
  });


  return Indicator_descriptions
}

// Indicator_threshold_descriptions
exports.indicator_threshold_descriptions = function (sequelize, Sequelize) {

  // Model Definition
  var Indicator_threshold_descriptions = sequelize.define('Indicator_threshold_descriptions', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    thresholdId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    language: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    name: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    description: {
      type: Sequelize.TEXT,
    }

  }, {
    timestamps: false
  });

  // *** Relations ***
  // 1 Indicator_thresholds has many Indicator_threshold_descriptions

  return Indicator_threshold_descriptions

}

// Indicators threshold model
exports.indicator_thresholds = function (sequelize, Sequelize) {

  // Importing so we can make relations
  var Indicator_threshold_descriptions = exports.indicator_threshold_descriptions(sequelize, Sequelize);

  // Model Definition
  var Indicator_thresholds = sequelize.define('Indicator_thresholds', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    indicatorId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    value: {
      type: Sequelize.INTEGER,
    },

    lowerBound: {
      type: Sequelize.FLOAT,
    },

    upperBound: {
      type: Sequelize.FLOAT,
    },

  }, {
    timestamps: false,
  });

  // *** Relations ***

  Indicator_thresholds.hasMany(Indicator_threshold_descriptions, { foreignKey: 'thresholdId' });
  Indicator_threshold_descriptions.belongsTo(Indicator_thresholds, { foreignKey: 'thresholdId' });

  return Indicator_thresholds

}

// Indicator model
exports.indicators = function (sequelize, Sequelize) {
  // importing so we can make relations
  var Pillars = exports.pillars(sequelize, Sequelize);
  var Nodes = exports.nodes(sequelize, Sequelize);
  var Themes = exports.themes(sequelize, Sequelize);
  var Assesment_types = exports.assesment_types(sequelize, Sequelize)
  // importing so we can make relations
  var Indicator_thresholds = exports.indicator_thresholds(sequelize, Sequelize);
  // Importing so we can make relations
  var Indicator_descriptions = exports.indicator_descriptions(sequelize, Sequelize);
  // Model definition
  var Indicators = sequelize.define('Indicators', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    pillarId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    nodeId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    themeId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    assesment_typeId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    unit: {
      type: Sequelize.STRING,
    },

    required: {
      type: Sequelize.BOOLEAN,
      notEmpty: true,
      default: false
    },

    weight: {
      type: Sequelize.FLOAT,
    },

    isInput: {
      type: Sequelize.BOOLEAN,
      notEmpty: true,
      default: false
    }

  }, {
    timestamps: false
  });

  // *** Relations ***
  // 1 Pillars has multiple Indicators
  Pillars.hasMany(Indicators, { foreignKey: 'pillarId' });
  Indicators.belongsTo(Pillars, { foreignKey: 'pillarId' });

  // 1 Node has multiple Indicators
  Nodes.hasMany(Indicators, { foreignKey: 'nodeId' });
  Indicators.belongsTo(Nodes, { foreignKey: 'nodeId' });

  // 1 Theme has multiple Indicators
  Themes.hasMany(Indicators, { foreignKey: 'themeId' });
  Indicators.belongsTo(Themes, { foreignKey: 'themeId' });

  // 1 Assesment_types has many Indicators
  Assesment_types.hasMany(Indicators, { foreignKey: 'assesment_typeId' });
  Indicators.belongsTo(Assesment_types, { foreignKey: 'assesment_typeId' })

  // 1 Indicators has 1 thresholds
  Indicators.hasMany(Indicator_thresholds, { foreignKey: 'indicatorId' });
  Indicator_thresholds.belongsTo(Indicators, { foreignKey: 'indicatorId' });

  // 1 Indicator has many Indicator_descriptions
  Indicators.hasMany(Indicator_descriptions, { foreignKey: 'indicatorId' });
  Indicator_descriptions.belongsTo(Indicators, { foreignKey: 'indicatorId' });

  return Indicators
}

// Assesment type descriptions
exports.assesment_type_description = function (sequelize, Sequelize) {

  // importing so we can make relations
  var Assesment_types = exports.assesment_types(sequelize, Sequelize);

  // Model definition
  var Assesment_type_descriptions = sequelize.define('Assesment_type_descriptions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    assesment_typeId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    language: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    name: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    modelPath: {
      type: Sequelize.STRING,
    },

    description: {
      type: Sequelize.TEXT,
    }

  }, {
    timestamps: false
  });

  // *** Relations ***
  // 1 Assesment_types has many Assesment_type_descriptions
  Assesment_types.hasMany(Assesment_type_descriptions, { foreignKey: 'assesment_typeId' });
  Assesment_type_descriptions.belongsTo(Assesment_types, { foreignKey: 'assesment_typeId' });

  return Assesment_type_descriptions
}


// User Assesment Indicator model
exports.user_assesment_indicator = function (sequelize, Sequelize) {

  // importing so we can make relations
  var Assesments = exports.assesments(sequelize, Sequelize);
  var Users = exports.users(sequelize, Sequelize);
  var Indicators = exports.indicators(sequelize, Sequelize);
  var User_indicator_privilege = exports.user_indicator_privileges(sequelize, Sequelize);

  // Model Definition
  var User_assesment_indicator = sequelize.define('User_assesment_indicator', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true

    },

    assesmentId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    userId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    indicatorId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    userPriviligesId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    }

  }, {
    timestamps: false
  })

  // *** Relations **+
  // 1 Assesments has 1 User_assesment_indicator
  Assesments.hasOne(User_assesment_indicator, { foreignKey: 'assesmentId' });
  User_assesment_indicator.belongsTo(Assesments, { foreignKey: 'assesmentId' });

  // 1 Users has 1 User_assesment_indicator
  Users.hasOne(User_assesment_indicator, { foreignKey: 'userId' });
  User_assesment_indicator.belongsTo(Users, { foreignKey: 'userId' });

  // 1 Indicator has 1 User_assesment_indicator
  Indicators.hasOne(User_assesment_indicator, { foreignKey: 'indicatorId' });
  User_assesment_indicator.belongsTo(Indicators, { foreignKey: 'indicatorId' });

  // 1 User_indicator_privileges has 1 User_assesment_indicator
  User_indicator_privilege.hasOne(User_assesment_indicator, { foreignKey: 'userPriviligesId' });
  User_assesment_indicator.belongsTo(User_indicator_privilege, { foreignKey: 'userPriviligesId' });

  return User_assesment_indicator

}

// Assesment indicator answers
exports.assesment_indicator_answers = function (sequelize, Sequelize) {

  var Indicators = exports.indicators(sequelize, Sequelize);

  // Model Definition
  var Assesment_indicator_answers = sequelize.define('Assesment_indicator_answers', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    indicatorId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    value: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    userId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    assesmentId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    timestamp: {
      type: Sequelize.DATE,
      notEmpty: true
    }

  }, {
    timestamps: false
  })

  // *** Relations ***

  // 1 Indicators has 1 Assesment_indicator_answers
  Indicators.hasOne(Assesment_indicator_answers, { foreignKey: 'indicatorId' });
  Assesment_indicator_answers.belongsTo(Indicators, { foreignKey: 'indicatorId' });

  return Assesment_indicator_answers
}

// Indicator preference
exports.indicator_preference = function (sequelize, Sequelize) {

  // Model Definition
  var Indicator_preference = sequelize.define('Indicator_preference', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      type: Sequelize.STRING,
      notEmpty: true
    }

  }, {
    timestamps: false
  });

  return Indicator_preference
}

// Assesment indicator preferences
exports.assesment_indicator_preferences = function (sequelize, Sequelize) {

  // importing so we can make relations


  // Model Definition
  var Assesment_indicator_preferences = sequelize.define('Assesment_indicator_preferences', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    assesmentId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    indicatorId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    preferenceId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    }

  }, {
    timestamps: false
  });

  // *** Relations ***

  return Assesment_indicator_preferences
}

// Assesments Model TODO
exports.assesments = function (sequelize, Sequelize) {

  // importing so we can make relations
  var Assesment_types = exports.assesment_types(sequelize, Sequelize);
  var Users = exports.users(sequelize, Sequelize);
  var Indicators = exports.indicators(sequelize, Sequelize);
  var Indicator_preferences = exports.indicator_preference(sequelize, Sequelize);
  var Assesment_indicator_preferences = exports.assesment_indicator_preferences(sequelize, Sequelize);
  var Assesment_indicator_answers = exports.assesment_indicator_answers(sequelize, Sequelize);

  // Model Definition
  var Assesments = sequelize.define('Assesments', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    name: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    language: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    createdAt: {
      type: Sequelize.DATE,
      notEmpty: false
    },

    editedAt: {
      type: Sequelize.DATE,
    },

    assesment_typeId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    alternativeTo: {
      type: Sequelize.INTEGER,
    }

  }, {
    timestamps: false
  })

  // *** Relations ***
  // 1 Assesment has 1 Assesment_types
  Assesment_types.hasOne(Assesments, { foreignKey: 'assesment_typeId' });
  Assesments.belongsTo(Assesment_types, { foreignKey: 'assesment_typeId' });
  // 1 Assesments has many Assesment_indicator_preferences
  Assesments.hasMany(Assesment_indicator_preferences, { foreignKey: 'AssesmentId' });
  Assesment_indicator_preferences.belongsTo(Assesments, { foreignKey: 'AssesmentId' });

  // 1 Indicators has many Assesment_indicator_preferences
  Indicators.hasMany(Assesment_indicator_preferences, { foreignKey: 'indicatorId' });
  Assesment_indicator_preferences.belongsTo(Indicators, { foreignKey: 'indicatorId' });

  // 1 Indicator_preference has many Assesment_indicator_preferences
  Indicator_preferences.hasMany(Assesment_indicator_preferences, { foreignKey: 'preferenceId' });
  Assesment_indicator_preferences.belongsTo(Indicator_preferences, { foreignKey: 'preferenceId' });


  // 1 Users has 1 Assesment_indicator_answers
  Users.hasOne(Assesment_indicator_answers, { foreignKey: 'userId' });
  Assesment_indicator_answers.belongsTo(Users, { foreignKey: 'userId' });

  // 1 Assesment has 1 Assesment_indicator_answers
  Assesments.hasMany(Assesment_indicator_answers, { foreignKey: 'assesmentId' }); // fixed relation was hasOne before
  Assesment_indicator_answers.belongsTo(Assesments, { foreignKey: 'assesmentId' });

  // 1 Assesments

  return Assesments
}
