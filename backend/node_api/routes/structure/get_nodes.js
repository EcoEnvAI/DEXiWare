const db = require('../../config/database');

function getNodes(req, res) {
  return db.nodes.findAll(
    {
      include: [
        {
          model: db.node_descriptions
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
      ],
      order: ['idx']
    }
  ).then((nodes) => {
    return res.status(200).json(nodes);
  })
}

module.exports = getNodes