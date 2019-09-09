"""add tutorial table

Revision ID: f7c347326521
Revises: 38b7b9099636
Create Date: 2019-09-04 18:44:57.600005

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f7c347326521'
down_revision = '38b7b9099636'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('tutorial',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('connection_id', sa.Integer(), nullable=False),
    sa.Column('action_type', sa.Integer(), nullable=False),
    sa.Column('time', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['connection_id'], ['connection.id'], name=op.f('fk_tutorial_connection_id_connection')),
    sa.PrimaryKeyConstraint('id', name=op.f('pk_tutorial'))
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('tutorial')
    # ### end Alembic commands ###
