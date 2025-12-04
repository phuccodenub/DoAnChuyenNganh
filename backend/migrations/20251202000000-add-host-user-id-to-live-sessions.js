'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Kiểm tra xem bảng live_sessions có tồn tại không
    const tableExists = await queryInterface.sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'live_sessions'
      );`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!tableExists[0].exists) {
      console.log('Table live_sessions does not exist, creating it...');
      
      // Tạo bảng live_sessions nếu chưa tồn tại
      await queryInterface.createTable('live_sessions', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        course_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'courses', key: 'id' },
          onDelete: 'SET NULL',
        },
        host_user_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: 'users', key: 'id' },
          onDelete: 'CASCADE',
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        description: Sequelize.TEXT,
        scheduled_start: Sequelize.DATE,
        scheduled_end: Sequelize.DATE,
        actual_start: Sequelize.DATE,
        actual_end: Sequelize.DATE,
        duration_minutes: Sequelize.INTEGER,
        meeting_url: Sequelize.TEXT,
        meeting_id: Sequelize.STRING(100),
        meeting_password: Sequelize.STRING(100),
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
        thumbnail_url: Sequelize.TEXT,
        stream_key: Sequelize.TEXT,
        playback_url: Sequelize.TEXT,
        recording_url: Sequelize.TEXT,
        max_participants: Sequelize.INTEGER,
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
        category: Sequelize.STRING(100),
        metadata: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {},
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      });
      
      console.log('Table live_sessions created successfully');
      return;
    }

    // Kiểm tra xem column host_user_id đã tồn tại chưa
    const columnExists = await queryInterface.sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_sessions' 
        AND column_name = 'host_user_id'
      );`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!columnExists[0].exists) {
      console.log('Adding host_user_id column to live_sessions...');
      
      // Thêm column host_user_id
      await queryInterface.addColumn('live_sessions', 'host_user_id', {
        type: Sequelize.UUID,
        allowNull: true, // Tạm thời cho phép null
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      });

      // Cập nhật các record hiện có với một user mặc định (instructor đầu tiên)
      await queryInterface.sequelize.query(`
        UPDATE live_sessions 
        SET host_user_id = (
          SELECT id FROM users WHERE role = 'instructor' LIMIT 1
        )
        WHERE host_user_id IS NULL;
      `);

      // Đặt NOT NULL constraint sau khi đã có dữ liệu
      await queryInterface.changeColumn('live_sessions', 'host_user_id', {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      });

      console.log('Column host_user_id added successfully');
    } else {
      console.log('Column host_user_id already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    const columnExists = await queryInterface.sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'live_sessions' 
        AND column_name = 'host_user_id'
      );`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (columnExists[0].exists) {
      await queryInterface.removeColumn('live_sessions', 'host_user_id');
    }
  }
};
