const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CampusFind API',
      version: '1.0.0',
      description: 'Lost & Found System API for College Communities',
      contact: {
        name: 'CampusFind Support',
        url: 'https://campusfind-0463.onrender.com',
        email: 'support@campusfind.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://campusfind-0463.onrender.com',
        description: 'Production Server'
      },
      {
        url: 'http://localhost:5000',
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Bearer token for authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            student_id: {
              type: 'string',
              example: 'S12345'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'student@conestogac.on.ca'
            },
            first_name: {
              type: 'string',
              example: 'John'
            },
            last_name: {
              type: 'string',
              example: 'Doe'
            },
            campus: {
              type: 'string',
              example: 'Main'
            },
            program: {
              type: 'string',
              example: 'Mobile and Web Development'
            },
            role: {
              type: 'string',
              enum: ['student', 'staff'],
              example: 'student'
            },
            is_verified: {
              type: 'boolean',
              example: true
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Item: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            title: {
              type: 'string',
              example: 'iPhone 14 Pro'
            },
            category: {
              type: 'string',
              enum: ['electronics', 'textbooks', 'keys', 'id_cards', 'clothing', 'bags', 'other'],
              example: 'electronics'
            },
            description: {
              type: 'string',
              example: 'Found near library entrance'
            },
            location_found: {
              type: 'string',
              example: 'Library Building - Main Entrance'
            },
            campus: {
              type: 'string',
              example: 'Main'
            },
            status: {
              type: 'string',
              enum: ['found', 'lost', 'claimed'],
              example: 'found'
            },
            image_url: {
              type: 'string',
              nullable: true,
              example: '/uploads/1705123456789.jpg'
            },
            user_id: {
              type: 'integer',
              example: 1
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Claim: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            item_id: {
              type: 'integer',
              example: 1
            },
            claimer_id: {
              type: 'integer',
              example: 2
            },
            owner_id: {
              type: 'integer',
              nullable: true,
              example: 1
            },
            status: {
              type: 'string',
              enum: ['pending', 'verified', 'rejected', 'completed'],
              example: 'pending'
            },
            verification_notes: {
              type: 'string',
              nullable: true,
              example: 'User provided proof of ownership'
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Error description'
            }
          }
        }
      }
    },
    security: []
  },
  apis: [
    './routes/authRoutes.js',
    './routes/itemRoutes.js',
    './routes/claimRoutes.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
