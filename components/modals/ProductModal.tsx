
import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { XIcon } from '../ui/Icons';

const ProductModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    product: Product | null;
}> = ({ isOpen, onClose, onSave, product }) => {
    const [name, setName] = useState('');
    const [purchasePrice, setPurchasePrice] = useState(0);
    const [sellingPrice, setSellingPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [lowStockThreshold, setLowStockThreshold] = useState(5);

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setName(product.name);
                setPurchasePrice(product.purchasePrice);
                setSellingPrice(product.sellingPrice);
                setStock(product.stock);
                setLowStockThreshold(product.lowStockThreshold);
            } else {
                setName('');
                setPurchasePrice(0);
                setSellingPrice(0);
                setStock(0);
                setLowStockThreshold(5);
            }
        }
    }, [product, isOpen]);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            id: product?.id || Date.now().toString(), 
            name, purchasePrice, sellingPrice, stock, lowStockThreshold
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input type="text" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Purchase Price" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                        <input type="number" placeholder="Selling Price" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder="Stock Quantity" value={stock} onChange={e => setStock(Number(e.target.value))} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                        <input type="number" placeholder="Low Stock Alert" value={lowStockThreshold} onChange={e => setLowStockThreshold(Number(e.target.value))} required className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-md mr-2">Cancel</button>
                        <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;