const NormalPost = require('../models/NormalPost');
const RegisteredPost = require('../models/RegisteredPost');
const Email = require('../models/Email');
const Fax = require('../models/Fax');

// Get counts for all letter types
exports.getLetterCounts = async (req, res) => {
  try {
    const [normal, registered, email, fax] = await Promise.all([
      NormalPost.count(),
      RegisteredPost.count(),
      Email.count(),
      Fax.count()
    ]);

    // Get status counts for all letters
    const [pending, processing, completed] = await Promise.all([
      NormalPost.count({ where: { status: 'pending' } })
        .then(normalPending => 
          RegisteredPost.count({ where: { status: 'pending' } })
            .then(regPending => 
              Email.count({ where: { status: 'pending' } })
                .then(emailPending =>
                  Fax.count({ where: { status: 'pending' } })
                    .then(faxPending => normalPending + regPending + emailPending + faxPending)
                )
            )
        ),
      // Similar for processing and completed statuses
      NormalPost.count({ where: { status: 'processing' } })
        .then(normalProcessing => 
          RegisteredPost.count({ where: { status: 'processing' } })
            .then(regProcessing => 
              Email.count({ where: { status: 'processing' } })
                .then(emailProcessing =>
                  Fax.count({ where: { status: 'processing' } })
                    .then(faxProcessing => normalProcessing + regProcessing + emailProcessing + faxProcessing)
                )
            )
        ),
      NormalPost.count({ where: { status: 'completed' } })
        .then(normalCompleted => 
          RegisteredPost.count({ where: { status: 'completed' } })
            .then(regCompleted => 
              Email.count({ where: { status: 'completed' } })
                .then(emailCompleted =>
                  Fax.count({ where: { status: 'completed' } })
                    .then(faxCompleted => normalCompleted + regCompleted + emailCompleted + faxCompleted)
                )
            )
        )
    ]);

    const total = normal + registered + email + fax;

    res.json({
      total,
      normal,
      registered,
      email,
      fax,
      pending,
      processing,
      completed
    });
  } catch (error) {
    console.error('Error getting letter counts:', error);
    res.status(500).json({ message: 'Error getting letter counts', error: error.message });
  }
};

// Get all letters with optional type filter
exports.getLetters = async (req, res) => {
  try {
    const { type } = req.query;
    let letters = [];

    if (!type) {
      // Get all letters from all types
      const [normalPosts, registeredPosts, emails, faxes] = await Promise.all([
        NormalPost.findAll({ order: [['createdAt', 'DESC']] }),
        RegisteredPost.findAll({ order: [['createdAt', 'DESC']] }),
        Email.findAll({ order: [['createdAt', 'DESC']] }),
        Fax.findAll({ order: [['createdAt', 'DESC']] })
      ]);

      // Combine all letters and sort by createdAt
      letters = [
        ...normalPosts.map(p => ({ ...p.toJSON(), type: 'normal' })),
        ...registeredPosts.map(p => ({ ...p.toJSON(), type: 'registered' })),
        ...emails.map(e => ({ ...e.toJSON(), type: 'email' })),
        ...faxes.map(f => ({ ...f.toJSON(), type: 'fax' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Get letters of specific type
      switch (type) {
        case 'normal':
          letters = await NormalPost.findAll({ order: [['createdAt', 'DESC']] });
          break;
        case 'registered':
          letters = await RegisteredPost.findAll({ order: [['createdAt', 'DESC']] });
          break;
        case 'email':
          letters = await Email.findAll({ order: [['createdAt', 'DESC']] });
          break;
        case 'fax':
          letters = await Fax.findAll({ order: [['createdAt', 'DESC']] });
          break;
        default:
          return res.status(400).json({ message: 'Invalid letter type' });
      }
    }

    res.json(letters);
  } catch (error) {
    console.error('Error getting letters:', error);
    res.status(500).json({ message: 'Error getting letters', error: error.message });
  }
};
