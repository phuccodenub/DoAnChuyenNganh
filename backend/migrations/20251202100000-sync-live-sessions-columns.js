'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Kiểm tra xem bảng live_sessions có tồn tại không
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('live_sessions')) {
      console.log('Table live_sessions does not exist, skipping migration');
      return;
    }

    // Lấy danh sách columns hiện tại
    const tableDescription = await queryInterface.describeTable('live_sessions');
    
    // Danh sách các cột cần thêm
    const columnsToAdd = {
      scheduled_start: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      scheduled_end: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      actual_start: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      actual_end: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      meeting_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      meeting_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      meeting_password: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      platform: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'internal',
      },
      ingest_type: {
        type: Sequelize.ENUM('webrtc', 'rtmp'),
        allowNull: false,
        defaultValue: 'webrtc',
      },
      webrtc_room_id: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      webrtc_config: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      status: {
        type: Sequelize.ENUM('scheduled', 'live', 'ended', 'cancelled'),
        defaultValue: 'scheduled',
      },
      viewer_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      thumbnail_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      stream_key: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      playback_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      recording_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      max_participants: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_public: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_recorded: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
    };

    // Thêm các cột còn thiếu
    for (const [columnName, columnDef] of Object.entries(columnsToAdd)) {
      if (!tableDescription[columnName]) {
        try {
          console.log(`Adding column ${columnName} to live_sessions...`);
          await queryInterface.addColumn('live_sessions', columnName, columnDef);
          console.log(`Column ${columnName} added successfully`);
        } catch (error) {
          // Nếu là lỗi ENUM đã tồn tại, bỏ qua
          if (error.message && error.message.includes('already exists')) {
            console.log(`Column ${columnName} or related type already exists, skipping`);
          } else {
            throw error;
          }
        }
      } else {
        console.log(`Column ${columnName} already exists, skipping`);
      }
    }

    console.log('All missing columns added successfully');
  },

  async down(queryInterface, Sequelize) {
    // Không xóa các cột trong down vì có thể gây mất dữ liệu
    console.log('Down migration not implemented to prevent data loss');
  }
};
