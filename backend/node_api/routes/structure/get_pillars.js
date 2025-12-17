const db = require('../../config/database');

function getPillars(req, res) {
  return db.pillars.findAll(
    {
      include: [
        {
          model: db.pillar_descriptions
        },
        {
          model: db.thresholds,
          separate: true,
          required: false,
          include: [
            {
              model: db.threshold_descriptions,
              required: false
            }
          ],
          order: ['value']
        },
        {
          model: db.nodes,
          required: false,
          include: [
            {
              model: db.node_descriptions,
              required: false
            },
            {
              model: db.thresholds,
              separate: true,
              required: false,
              include: [
                {
                  model: db.threshold_descriptions,
                  required: false
                }
              ],
              order: ['value']
            }
          ]
        }
      ],
      order: ['id']
    }
  ).then((pillars) => {
    return res.status(200).json(pillars);
  })
}

module.exports = getPillars