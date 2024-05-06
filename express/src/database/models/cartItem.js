module.exports = (sequelize, DataTypes) => {
    const CartItem = sequelize.define('CartItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        cartID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                models: 'shoppingcarts',
                key: 'id'
            }
        },

        productID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                models: 'products',
                key: 'id'
            }
        },

        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        tableName: 'cartitem'

    });

    return CartItem;
}