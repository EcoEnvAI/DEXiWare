'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('User_roles', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
    
        role_name: {
          type: Sequelize.STRING,
          notEmpty: true
        }
      }),

      queryInterface.createTable('Users', {

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
        },
    
        role: {
          type: Sequelize.INTEGER
        },
        
        assessmentId: {
          type: Sequelize.INTEGER
        },
    
      }),

      queryInterface.createTable('User_indicator_privileges', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
    
        role: {
          type: Sequelize.STRING,
          notEmpty: true
        }
    
      }),
      queryInterface.createTable('Node_descriptions', {
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
    
      }),
      queryInterface.createTable('Nodes', {
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
        }
      }),
      queryInterface.createTable('Pillar_descriptions', {
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
    
      }),
      queryInterface.createTable('Pillars', {
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
    
      }),
      queryInterface.createTable('Theme_descriptions', {
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
    
      }),
      queryInterface.createTable('Themes', {
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
    
      }),
      queryInterface.createTable('Assessment_types', {

        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
    
        indicatorId: {
          type: Sequelize.INTEGER,
        }
    
      }),
      queryInterface.createTable('Indicator_descriptions', {
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
    
      }),
      queryInterface.createTable('Indicator_threshold_descriptions', {

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
    
      }),
      queryInterface.createTable('Indicator_thresholds', {
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
    
      }),
      queryInterface.createTable('Indicators', {
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
    
      }),
      queryInterface.createTable('Assessment_type_descriptions', {
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
    
      }),
      queryInterface.createTable('User_assessment_indicators', {

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
    
      }),
      queryInterface.createTable('Assessment_indicator_answers', {

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
        }
    
      }),
      queryInterface.createTable('Indicator_preferences', {

        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
    
        name: {
          type: Sequelize.STRING,
          notEmpty: true
        }
    
      }),
      queryInterface.createTable('Assessment_indicator_preferences', {

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
    
      }),
      queryInterface.createTable('Assessments', {

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
        }
    
      })
    ]).then(() => {
      return Promise.all([
        queryInterface.addConstraint('Assessments', {
          fields: ['assessment_typeId'], 
          type: 'FOREIGN KEY',
          name: 'Assessments_assessment_typeId_fkey',
          references: {
            table: 'Assessment_types',
            field: 'id'
          },
          onDelete: 'cascade'
        }),
        queryInterface.addConstraint('Users', {
          fields: ['assessmentId'], 
          type: 'FOREIGN KEY',
          name: 'Users_assessmentId_fkey',
          references: {
            table: 'Assessments',
            field: 'id'
          },
          onDelete: 'NO ACTION'
        }),
        queryInterface.addConstraint('Users', {
          fields: ['role'],
          type: 'FOREIGN KEY',
          name: 'Users_role_fkey',
          references: {
            table: 'User_roles',
            field: 'id'
          },
          onDelete: 'SET NULL'
        }),
        queryInterface.addConstraint('Node_descriptions', {
          fields: ['node_id'],
          type: 'FOREIGN KEY',
          name: 'Node_descriptions_node_id_fkey',
          references: {
            table: 'Nodes',
            field: 'id'
          },
          onDelete: 'NO ACTION'
        }),
        queryInterface.addConstraint('Pillar_descriptions', {
          fields: ['pillar_id'],
          type: 'FOREIGN KEY',
          name: 'Pillar_descriptions_pillar_id_fkey',
          references: {
            table: 'Pillars',
            field: 'id'
          },
          onDelete: 'NO ACTION'
        }),
        queryInterface.addConstraint('Themes', {
          fields: ['themeId'],
          type: 'FOREIGN KEY',
          name: 'Themes_themeId_fkey',
          references: {
            table: 'Themes',
            field: 'id'
          },
          onDelete: 'SET NULL'
        }),
        queryInterface.addConstraint('Theme_descriptions', {
          fields: ['themeId'],
          type: 'FOREIGN KEY',
          name: 'Theme_descriptions_themeId_fkey',
          references: {
            table: 'Themes',
            field: 'id'
          },
          onDelete: 'NO ACTION'
        }),
        queryInterface.addConstraint('Indicators', {
          fields: ['pillarId'],
          type: 'FOREIGN KEY',
          name: 'Indicators_pillarId_fkey',
          references: {
            table: 'Pillars',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('Indicators', {
          fields: ['nodeId'],
          type: 'FOREIGN KEY',
          name: 'Indicators_nodeId_fkey',
          references: {
            table: 'Nodes',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('Indicators', {
          fields: ['themeId'],
          type: 'FOREIGN KEY',
          name: 'Indicators_themeId_fkey',
          references: {
            table: 'Themes',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('Indicators', {
          fields: ['assessment_typeId'],
          type: 'FOREIGN KEY',
          name: 'Indicators_assessment_typeId_fkey',
          references: {
            table: 'Assessment_types',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('Indicator_descriptions', {
          fields: ['indicatorId'],
          type: 'FOREIGN KEY',
          name: 'Indicator_descriptions_indicatorId_fkey',
          references: {
            table: 'Indicators',
            field: 'id'
          },
          onDelete: 'NO ACTION'
        }),
        queryInterface.addConstraint('Indicator_thresholds', {
          fields: ['indicatorId'],
          type: 'FOREIGN KEY',
          name: 'Indicator_thresholds_indicatorId_fkey',
          references: {
            table: 'Indicators',
            field: 'id'
          },
          onDelete: 'NO ACTION'
        }),
        queryInterface.addConstraint('Indicator_threshold_descriptions', {
          fields: ['thresholdId'],
          type: 'FOREIGN KEY',
          name: 'Indicator_threshold_descriptions_thresholdId_fkey',
          references: {
            table: 'Indicator_thresholds',
            field: 'id'
          },
          onDelete: 'NO ACTION'
        }),
        queryInterface.addConstraint('Assessment_type_descriptions', {
          fields: ['assessment_typeId'],
          type: 'FOREIGN KEY',
          name: 'Assessment_type_descriptions_assessment_typeId_fkey',
          references: {
            table: 'Assessment_types',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('User_assessment_indicators', {
          fields: ['assessmentId'],
          type: 'FOREIGN KEY',
          name: 'User_assessment_indicators_assessmentId_fkey',
          references: {
            table: 'Assessments',
            field: 'id'
          },
          onDelete: 'NO ACTION'
        }),
        queryInterface.addConstraint('User_assessment_indicators', {
          fields: ['userId'],
          type: 'FOREIGN KEY',
          name: 'User_assessment_indicators_userId_fkey',
          references: {
            table: 'Users',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('User_assessment_indicators', {
          fields: ['indicatorId'],
          type: 'FOREIGN KEY',
          name: 'User_assessment_indicators_indicatorId_fkey',
          references: {
            table: 'Indicators',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('User_assessment_indicators', {
          fields: ['userPrivilegeId'],
          type: 'FOREIGN KEY',
          name: 'User_assessment_indicators_userPrivilegeId_fkey',
          references: {
            table: 'User_indicator_privileges',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('Assessment_indicator_answers', {
          fields: ['indicatorId'],
          type: 'FOREIGN KEY',
          name: 'Assessment_indicator_answers_indicatorId_fkey',
          references: {
            table: 'Indicators',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('Assessment_indicator_answers', {
          fields: ['userId'],
          type: 'FOREIGN KEY',
          name: 'Assessment_indicator_answers_userId_fkey',
          references: {
            table: 'Users',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('Assessment_indicator_answers', {
          fields: ['assessmentId'],
          type: 'FOREIGN KEY',
          name: 'Assessment_indicator_answers_assessmentId_fkey',
          references: {
            table: 'Assessments',
            field: 'id'
          },
          onDelete: 'NO ACTION'
        }),
        queryInterface.addConstraint('Assessment_indicator_preferences', {
          fields: ['indicatorId'],
          type: 'FOREIGN KEY',
          name: 'Assessment_indicator_preferences_indicatorId_fkey',
          references: {
            table: 'Indicators',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('Assessment_indicator_preferences', {
          fields: ['preferenceId'],
          type: 'FOREIGN KEY',
          name: 'Assessment_indicator_preferences_preferenceId_fkey',
          references: {
            table: 'Indicator_preferences',
            field: 'id'
          },
          onDelete: 'CASCADE'
        }),
        queryInterface.addConstraint('Assessment_indicator_preferences', {
          fields: ['assessmentId'],
          type: 'FOREIGN KEY',
          name: 'Assessment_indicator_preferences_AssessmentId_fkey',
          references: {
            table: 'Assessments',
            field: 'id'
          },
          onDelete: 'SET NULL'
        })
      ])
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
