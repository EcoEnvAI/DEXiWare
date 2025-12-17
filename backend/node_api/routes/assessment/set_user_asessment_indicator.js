const db = require('../../config/database');

async function setPrivilege(assessmentId, userId, indicatorId, privilegeId, value) {
  if (value) {
    // upsert
    return await db.user_assessment_indicator.upsert({
      userId: userId,
      assessmentId: assessmentId,
      indicatorId: indicatorId,
      userPrivilegeId: privilegeId
    },
    {
      returning: true
    }).then(() => {
      return true; 
    }).catch((err) => {
      return false;
    });
  } else {
    // remove
    return await db.user_assessment_indicator.findOne({
      where: {
        userId: userId,
        assessmentId: assessmentId,
        indicatorId: indicatorId,
        userPrivilegeId: privilegeId
      }
    }).then((item) => {
      if (item) {
        return item.destroy().then((ret) => true);
      } else {
        return true;
      }
    }).catch((err) => {
      return false;
    });
  }
}


async function setSingleIndicator(assessmentId, indicatorId, userId, privileges, privilegeIds) {
  let ret = true;
  for (let privilege in privileges) {
    let privilegeId = privilegeIds.find((p) => p.role == privilege);
    
    let success = await setPrivilege(assessmentId, userId, indicatorId, privilegeId.id, privileges[privilege]);

    ret = ret && success;
  }
  return ret;
}

async function setUserAssessmentIndicator(req, res) {
  let privilegeIds = await db.user_indicator_privileges.findAll();
  
  if (req.params.iId) {
    if (await setSingleIndicator(req.params.aId, req.params.iId, req.params.uId, req.body, privilegeIds)) {
      return res.status(200).json();
    } else {
      return res.status(500).send();
    }
    
  } else if (req.params.pId) {
    let where = {
      pillarId: req.params.pId
    };

    if (req.params.nId) {
     where.nodeId = req.params.nId;   
    }

    const [privilege, value] = Object.entries(req.body)[0];
    let privilegeId = privilegeIds.find((p) => p.role == privilege);

    if (await db.indicators.findAll({
      where: where
    }).then(async (indicators) => {
      let ret = true;
      for (let indicator of indicators) {
        let success = await setPrivilege(req.params.aId, req.params.uId, indicator.id, privilegeId.id, value);
        ret = ret && success;
      }
      return ret;
    })) {
      return res.status(200).json();
    } else {
      return res.status(500).send();
    }
  } else {
    return res.status(400).send();
  }
}

module.exports = setUserAssessmentIndicator;