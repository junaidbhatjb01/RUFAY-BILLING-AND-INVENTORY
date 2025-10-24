
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Product } from '../../types';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/ui/Icons';
import ProductModal from '../../components/modals/ProductModal';

const ProductList: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct, settings } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleSaveProduct = async (productData: Product) => {
        try {
            if (editingProduct) {
                await updateProduct(productData);
            } else {
                const { id, ...newProductData } = productData;
                await addProduct(newProductData);
            }
            setEditingProduct(null);
        } catch (error) {
            console.error("Failed to save product:", error);
            alert("Error: Could not save product.");
        }
    };

    const handleDelete = (id: string) => {
        if(window.confirm("Are you sure? This will remove the product from your inventory.")) {
            deleteProduct(id).catch(err => {
                console.error("Failed to delete product:", err);
                alert("Error: Could not delete product.");
            });
        }
    };
    
    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };
    
    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Stock / Inventory</h1>
                <button onClick={openAddModal} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Product
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Purchase Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Selling Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stock</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{settings.currency}{product.purchasePrice.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{settings.currency}{product.sellingPrice.toFixed(2)}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${product.stock <= product.lowStockThreshold ? 'text-red-500' : 'text-green-500'}`}>{product.stock}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openEditModal(product)} className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-200 mr-4"><EditIcon className="w-5 h-5 inline" /></button>
                                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"><TrashIcon className="w-5 h-5 inline" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {products.length === 0 && <p className="text-center py-8 text-gray-500">No products found. Add your first product to get started.</p>}
            </div>
            <ProductModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                product={editingProduct}
            />
        </div>
    );
};

export default ProductList;
