"""initial GreenCampus database schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-06 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=20), server_default='student', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # 2. issues table (ResourceCare)
    op.create_table(
        'issues',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('reported_by', sa.Integer(), nullable=False),
        sa.Column('issue_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('location', sa.String(length=255), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='reported', nullable=False),
        sa.Column('assigned_to', sa.Integer(), nullable=True),
        sa.Column('estimated_water_saved', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('estimated_energy_saved', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('estimated_waste_reduced', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['reported_by'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_issues_id'), 'issues', ['id'], unique=False)
    op.create_index(op.f('ix_issues_reported_by'), 'issues', ['reported_by'], unique=False)
    op.create_index(op.f('ix_issues_assigned_to'), 'issues', ['assigned_to'], unique=False)
    op.create_index(op.f('ix_issues_status'), 'issues', ['status'], unique=False)

    # 3. issue_updates table
    op.create_table(
        'issue_updates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('issue_id', sa.Integer(), nullable=False),
        sa.Column('updated_by', sa.Integer(), nullable=False),
        sa.Column('old_status', sa.String(length=20), nullable=True),
        sa.Column('new_status', sa.String(length=20), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['issue_id'], ['issues.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['updated_by'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_issue_updates_id'), 'issue_updates', ['id'], unique=False)
    op.create_index(op.f('ix_issue_updates_issue_id'), 'issue_updates', ['issue_id'], unique=False)
    op.create_index(op.f('ix_issue_updates_updated_by'), 'issue_updates', ['updated_by'], unique=False)

    # 4. items table (GreenShare)
    op.create_table(
        'items',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('condition', sa.String(length=50), server_default='good', nullable=False),
        sa.Column('availability_status', sa.String(length=20), server_default='available', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_items_id'), 'items', ['id'], unique=False)
    op.create_index(op.f('ix_items_owner_id'), 'items', ['owner_id'], unique=False)
    op.create_index(op.f('ix_items_category'), 'items', ['category'], unique=False)
    op.create_index(op.f('ix_items_availability_status'), 'items', ['availability_status'], unique=False)

    # 5. borrow_requests table
    op.create_table(
        'borrow_requests',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('requester_id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='pending', nullable=False),
        sa.Column('requested_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('responded_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['requester_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_borrow_requests_id'), 'borrow_requests', ['id'], unique=False)
    op.create_index(op.f('ix_borrow_requests_item_id'), 'borrow_requests', ['item_id'], unique=False)
    op.create_index(op.f('ix_borrow_requests_requester_id'), 'borrow_requests', ['requester_id'], unique=False)
    op.create_index(op.f('ix_borrow_requests_owner_id'), 'borrow_requests', ['owner_id'], unique=False)
    op.create_index(op.f('ix_borrow_requests_status'), 'borrow_requests', ['status'], unique=False)

    # 6. borrow_transactions table
    op.create_table(
        'borrow_transactions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('item_id', sa.Integer(), nullable=False),
        sa.Column('borrower_id', sa.Integer(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('borrow_request_id', sa.Integer(), nullable=True),
        sa.Column('borrowed_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('due_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('returned_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=20), server_default='active', nullable=False),
        sa.ForeignKeyConstraint(['borrow_request_id'], ['borrow_requests.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['borrower_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['item_id'], ['items.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_borrow_transactions_id'), 'borrow_transactions', ['id'], unique=False)
    op.create_index(op.f('ix_borrow_transactions_item_id'), 'borrow_transactions', ['item_id'], unique=False)
    op.create_index(op.f('ix_borrow_transactions_borrower_id'), 'borrow_transactions', ['borrower_id'], unique=False)
    op.create_index(op.f('ix_borrow_transactions_owner_id'), 'borrow_transactions', ['owner_id'], unique=False)
    op.create_index(op.f('ix_borrow_transactions_borrow_request_id'), 'borrow_transactions', ['borrow_request_id'], unique=False)
    op.create_index(op.f('ix_borrow_transactions_status'), 'borrow_transactions', ['status'], unique=False)

    # 7. green_points table
    op.create_table(
        'green_points',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('points', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(length=150), nullable=False),
        sa.Column('reference_type', sa.String(length=50), nullable=True),
        sa.Column('reference_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_green_points_id'), 'green_points', ['id'], unique=False)
    op.create_index(op.f('ix_green_points_user_id'), 'green_points', ['user_id'], unique=False)
    op.create_index(op.f('ix_green_points_reference_type'), 'green_points', ['reference_type'], unique=False)

    # 8. badges table
    op.create_table(
        'badges',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=False),
        sa.Column('icon', sa.String(length=100), nullable=False),
        sa.Column('points_required', sa.Integer(), server_default='0', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
    )
    op.create_index(op.f('ix_badges_id'), 'badges', ['id'], unique=False)

    # 9. user_badges association table
    op.create_table(
        'user_badges',
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('badge_id', sa.Integer(), nullable=False),
        sa.Column('earned_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['badge_id'], ['badges.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id', 'badge_id'),
    )

    # 10. notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.String(length=50), nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_notifications_id'), 'notifications', ['id'], unique=False)
    op.create_index(op.f('ix_notifications_user_id'), 'notifications', ['user_id'], unique=False)
    op.create_index(op.f('ix_notifications_is_read'), 'notifications', ['is_read'], unique=False)

    # 11. impact_records table
    op.create_table(
        'impact_records',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('issue_id', sa.Integer(), nullable=True),
        sa.Column('water_saved', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('energy_saved', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('waste_reduced', sa.Float(), server_default='0.0', nullable=False),
        sa.Column('items_shared', sa.Integer(), server_default='0', nullable=False),
        sa.Column('purchases_avoided', sa.Integer(), server_default='0', nullable=False),
        sa.Column('recorded_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['issue_id'], ['issues.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_impact_records_id'), 'impact_records', ['id'], unique=False)
    op.create_index(op.f('ix_impact_records_user_id'), 'impact_records', ['user_id'], unique=False)
    op.create_index(op.f('ix_impact_records_issue_id'), 'impact_records', ['issue_id'], unique=False)


def downgrade() -> None:
    # Drop in exact reverse order to respect foreign key constraints
    op.drop_table('impact_records')
    op.drop_table('notifications')
    op.drop_table('user_badges')
    op.drop_table('badges')
    op.drop_table('green_points')
    op.drop_table('borrow_transactions')
    op.drop_table('borrow_requests')
    op.drop_table('items')
    op.drop_table('issue_updates')
    op.drop_table('issues')
    op.drop_table('users')
