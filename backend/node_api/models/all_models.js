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

  User_roles.associate = function (models) {
    this.hasMany(models.users, { foreignKey: 'role' });
  }
  return User_roles
}

// Users model
exports.users = function (sequelize, Sequelize) {

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
      notEmpty: true,
      unique: true
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
    },

    assessmentId: {
      type: Sequelize.INTEGER
    },

    confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    confirmationEmailDate: {
        type: Sequelize.DATE,
        allowNull: true
    }
  }, {
    timestamps: false
  });

  // *** Relations ***
  Users.associate = function (models) {
    this.belongsTo(models.user_roles, { foreignKey: 'role' });
    this.hasOne(models.user_assessment_indicator, { foreignKey: 'userId' });
    this.hasOne(models.assessment_indicator_answers, { foreignKey: 'userId' });
    this.belongsTo(models.assessments, { foreignKey: 'assessmentId' });
    this.belongsToMany(models.assessments, { through: models.assessment_users, foreignKey: 'userId', otherKey: 'assessmentId', as: 'assessments' });
  }

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

  User_indicator_privileges.associate = function (models) {
    this.hasOne(models.user_assessment_indicator, { foreignKey: 'userPrivilegeId' });
  }

  return User_indicator_privileges
}

// Node descriptions model
exports.node_descriptions = function (sequelize, Sequelize) {

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

  Node_descriptions.associate = function(models) {
    this.belongsTo(models.nodes, { foreignKey: 'node_id' });
  }

  return Node_descriptions;
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
    },

    idx: {
      type: Sequelize.INTEGER,
      allowNull: true
    },

    pillarId: {
      type: Sequelize.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: false
  });

  Nodes.associate = function (models) {
    this.hasMany(models.node_descriptions, { foreignKey: 'node_id' });
    this.hasMany(models.indicators, { foreignKey: 'nodeId' });
    this.belongsTo(models.pillars, { foreignKey: 'pillarId'});
    this.hasMany(models.thresholds, { foreignKey: 'nodeId' });
  }

  return Nodes;
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

  Pillar_descriptions.associate = function(models) {
    this.belongsTo(models.pillars, { foreignKey: 'pillar_id' });
  }

  return Pillar_descriptions;
}

// Pillars model
exports.pillars = function (sequelize, Sequelize) {

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

  Pillars.associate = function (models) {
    this.hasMany(models.pillar_descriptions, { foreignKey: 'pillar_id' });
    this.hasMany(models.indicators, { foreignKey: 'pillarId' });
    this.hasMany(models.nodes, { foreignKey: 'pillarId' });
    this.hasMany(models.thresholds, { foreignKey: 'pillarId' });
  }
  
  return Pillars;
}

// Theme_descriptions model
exports.theme_descriptions = function (sequelize, Sequelize) {

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

  Theme_descriptions.associate = function (models) {
    this.belongsTo(models.themes, { foreignKey: 'themeId' });
  }

  return Theme_descriptions;
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
  Themes.associate = function (models) {
    // 1 themes can have many Themes
    this.hasMany(this, { foreignKey: 'themeId', as: 'childTheme'});
    this.belongsTo(this, { foreignKey: 'themeId', as: 'parentTheme'});
    this.hasMany(models.theme_descriptions, { foreignKey: 'themeId' });
    this.hasMany(models.indicators, { foreignKey: 'themeId' });
  }

  return Themes;
}

exports.assessment_types = function (sequelize, Sequelize) {


  // Model Definition
  var Assessment_types = sequelize.define('Assessment_types', {

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


  Assessment_types.associate = function (models) {
    this.hasMany(models.indicators, { foreignKey: 'assessment_typeId' });
    this.hasMany(models.assessment_type_description, { foreignKey: 'assessment_typeId' });
    this.hasOne(models.assessments, { foreignKey: 'assessment_typeId' });
  }

  return Assessment_types;
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

  Indicator_descriptions.associate = function (models) {
    this.belongsTo(models.indicators, { foreignKey: 'indicatorId' });
  }

  return Indicator_descriptions;
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

  Indicator_threshold_descriptions.associate = function (models) {
    this.belongsTo(models.indicator_thresholds, { foreignKey: 'thresholdId' });
  }

  return Indicator_threshold_descriptions;

}

// Indicators threshold model
exports.indicator_thresholds = function (sequelize, Sequelize) {

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

    color: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: false,
  });

  Indicator_thresholds.associate = function (models) {
    this.hasMany(models.indicator_threshold_descriptions, { foreignKey: 'thresholdId' });
    this.belongsTo(models.indicators, { foreignKey: 'indicatorId' });
  }

  return Indicator_thresholds;

}

// Indicator model
exports.indicators = function (sequelize, Sequelize) {
  
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

    assessment_typeId: {
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
  Indicators.associate = function (models) {
    this.hasMany(models.user_assessment_indicator, { foreignKey: 'indicatorId' });
    this.belongsTo(models.pillars, { foreignKey: 'pillarId' });
    this.belongsTo(models.nodes, { foreignKey: 'nodeId' });
    this.belongsTo(models.themes, { foreignKey: 'themeId' });
    this.belongsTo(models.assessment_types, { foreignKey: 'assessment_typeId' })
    this.hasMany(models.indicator_thresholds, { foreignKey: 'indicatorId' });
    this.hasMany(models.indicator_descriptions, { foreignKey: 'indicatorId' });
    this.hasMany(models.assessment_indicator_answers, { foreignKey: 'indicatorId' });
    this.hasMany(models.assessment_indicator_preferences, { foreignKey: 'indicatorId' });
  }
  return Indicators;
}

// Assessment type descriptions
exports.assessment_type_description = function (sequelize, Sequelize) {

  // Model definition
  var Assessment_type_descriptions = sequelize.define('Assessment_type_descriptions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    assessment_typeId: {
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

  Assessment_type_descriptions.associate = function (models) {
    this.belongsTo(models.assessment_types, { foreignKey: 'assessment_typeId' });
  }
  return Assessment_type_descriptions;
}


// User Assessment Indicator model
exports.user_assessment_indicator = function (sequelize, Sequelize) {

  // Model Definition
  var User_assessment_indicator = sequelize.define('User_assessment_indicator', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true

    },

    assessmentId: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      unique: 'compositeIndex'
    },

    userId: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      unique: 'compositeIndex'
    },

    indicatorId: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      unique: 'compositeIndex'
    },

    userPrivilegeId: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      unique: 'compositeIndex'
    }

  }, {
    timestamps: false
  })

  User_assessment_indicator.associate = function (models) {
    this.belongsTo(models.indicators, { foreignKey: 'indicatorId' });
    this.belongsTo(models.user_indicator_privileges, { foreignKey: 'userPrivilegeId' });
    this.belongsTo(models.users, { foreignKey: 'userId' });
    this.belongsTo(models.assessments, { foreignKey: 'assessmentId' });
  }
  
  return User_assessment_indicator;
}

// Assessment indicator answers
exports.assessment_indicator_answers = function (sequelize, Sequelize) {

  // Model Definition
  var Assessment_indicator_answers = sequelize.define('Assessment_indicator_answers', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    indicatorId: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      unique: 'compositeIndex'
    },

    value: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    userId: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      unique: 'compositeIndex'
    },

    assessmentId: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      unique: 'compositeIndex'
    },

    timestamp: {
      type: Sequelize.DATE,
      notEmpty: true
    },
    
    valid: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    timestamps: false
  })

  Assessment_indicator_answers.associate = function (models) {
    this.belongsTo(models.indicators, { foreignKey: 'indicatorId' });
    this.belongsTo(models.users, { foreignKey: 'userId' });    
    this.belongsTo(models.assessments, { foreignKey: 'assessmentId' });
    //this.belongsTo(models.indicator_thresholds, { foreignKey: 'value', targetKey: 'value'})
  }
  return Assessment_indicator_answers;
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

  Indicator_preference.associate = function (models) {
    this.hasMany(models.assessment_indicator_preferences, { foreignKey: 'preferenceId' });
  }

  return Indicator_preference;
}

// Assessment indicator preferences
exports.assessment_indicator_preferences = function (sequelize, Sequelize) {

  // Model Definition
  var Assessment_indicator_preferences = sequelize.define('Assessment_indicator_preferences', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    assessmentId: {
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

  Assessment_indicator_preferences.associate = function (models) {
    this.belongsTo(models.assessments, { foreignKey: 'AssessmentId' });
    this.belongsTo(models.indicators, { foreignKey: 'indicatorId' });
    this.belongsTo(models.indicator_preference, { foreignKey: 'preferenceId' });
  }

  return Assessment_indicator_preferences;
}

// Assessments Model TODO
exports.assessments = function (sequelize, Sequelize) {

  // Model Definition
  var Assessments = sequelize.define('Assessments', {

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

    assessment_typeId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    alternativeTo: {
      type: Sequelize.INTEGER,
    },

    userId: {
      type: Sequelize.INTEGER,
      allowNull: true
    }

  }, {
    timestamps: false
  })

  // *** Relations ***
  Assessments.associate = function (models) {
    this.belongsTo(models.assessment_types, { foreignKey: 'assessment_typeId' });
    this.hasMany(models.assessment_indicator_preferences, { foreignKey: 'AssessmentId' });
    this.hasMany(models.assessment_indicator_answers, { foreignKey: 'assessmentId' }); // fixed relation was hasOne before
    this.hasMany(models.user_assessment_indicator, { foreignKey: 'assessmentId' });
    this.belongsTo(models.users, { foreignKey: 'userId' });
    this.hasMany(models.assessment_scenarios, { foreignKey: 'assessmentId' });
    this.belongsToMany(models.users, { through: models.assessment_users, foreignKey: 'assessmentId', otherKey: 'userId', as: 'users' });
  }

  return Assessments;
}

exports.assessment_scenarios = function (sequelize, Sequelize) {

  // Model definition
  var Assessment_scenarios = sequelize.define('Assessment_scenarios', {

    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    
    assessmentId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    userId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    type: {
      type: Sequelize.STRING,
      notEmpty: true
    },

    content: {
      type: Sequelize.JSONB,
      notEmpty: true
    }
  }, {
    timestamps: false
  });

  Assessment_scenarios.associate = function (models) {
    this.belongsTo(models.assessments, { foreignKey: 'assessmentId' });
    this.belongsTo(models.users, { foreignKey: 'userId' });
  }
  return Assessment_scenarios
}

exports.thresholds = function (sequelize, Sequelize) {
  var Thresholds = sequelize.define('Thresholds', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    pillarId: {
      type: Sequelize.INTEGER
    },

    nodeId: {
      type: Sequelize.INTEGER
    },

    value: {
      type: Sequelize.INTEGER,
    },

    color: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: false,
  });

  Thresholds.associate = function (models) {
    this.hasMany(models.threshold_descriptions, { foreignKey: 'thresholdId' });
    this.belongsTo(models.pillars, { foreignKey: 'pillarId' });
    this.belongsTo(models.nodes, { foreignKey: 'nodeId' });
  }

  return Thresholds;
}

exports.threshold_descriptions = function (sequelize, Sequelize) {

  var Threshold_descriptions = sequelize.define('Threshold_descriptions', {

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

  Threshold_descriptions.associate = function (models) {
    this.belongsTo(models.indicator_thresholds, { foreignKey: 'thresholdId' });
  }

  return Threshold_descriptions;

}

exports.assessment_users = function (sequelize, Sequelize) {
  var Assessment_users = sequelize.define('Assessment_users', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    assessmentId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    },

    userId: {
      type: Sequelize.INTEGER,
      notEmpty: true
    }
  }, {
    timestamps: false
  });

  Assessment_users.associate = function (models) {
    this.belongsTo(models.assessments, { foreignKey: 'assessmentId' });
    this.belongsTo(models.users, { foreignKey: 'userId' });
  }
  return Assessment_users;
}