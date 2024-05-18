module.exports = (sequelize, DataTypes) => {
    const CartItem = sequelize.define('CartItem', {
        cartItemID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },

        cartID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'shoppingCarts',
                key: 'cartID'
            }
        },

        productID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Products',
                key: 'productID'
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
        tableName: 'cartItem'

    });

    return CartItem;
}