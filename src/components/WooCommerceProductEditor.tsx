import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Package,
  Settings,
  DollarSign,
  Truck,
  Link as LinkIcon,
  Layers,
  FileDown,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Tag,
  Folder,
  Sliders,
  Copy,
  Eye
} from 'lucide-react';
import { Product, ProductVariation, ProductAttribute, DownloadableFile } from '../types';

interface WooCommerceProductEditorProps {
  isOpen: boolean;
  product: Product | null; // null = Add New, non-null = Edit
  allProducts: Product[];
  onClose: () => void;
  onSave: (savedProduct: Product) => void;
}

type TabType = 'general' | 'inventory' | 'shipping' | 'linked' | 'attributes' | 'variations' | 'downloads' | 'advanced';

const PRESET_CATEGORIES = [
  'Books',
  'Devotionals',
  'Music',
  'Digital Resources',
  'Study Guides',
  'Ministry Bundles'
];

export function WooCommerceProductEditor({
  isOpen,
  product,
  allProducts,
  onClose,
  onSave
}: WooCommerceProductEditorProps) {
  const isEditing = Boolean(product && product.id);

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Core Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [productType, setProductType] = useState<Product['productType']>('simple');
  const [isVirtual, setIsVirtual] = useState(false);
  const [isDownloadable, setIsDownloadable] = useState(false);

  // General Tab
  const [regularPrice, setRegularPrice] = useState<string>('349');
  const [salePrice, setSalePrice] = useState<string>('');
  const [saleStartDate, setSaleStartDate] = useState('');
  const [saleEndDate, setSaleEndDate] = useState('');
  const [sku, setSku] = useState('');

  // Inventory Tab
  const [manageStock, setManageStock] = useState(true);
  const [stockQuantity, setStockQuantity] = useState<string>('50');
  const [stockStatus, setStockStatus] = useState<'instock' | 'outofstock' | 'onbackorder'>('instock');
  const [allowBackorders, setAllowBackorders] = useState<'no' | 'notify' | 'yes'>('no');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('5');
  const [soldIndividually, setSoldIndividually] = useState(false);

  // Shipping Tab
  const [weightKg, setWeightKg] = useState<string>('0.3');
  const [lengthCm, setLengthCm] = useState<string>('21');
  const [widthCm, setWidthCm] = useState<string>('14');
  const [heightCm, setHeightCm] = useState<string>('1.5');
  const [shippingClass, setShippingClass] = useState('standard');

  // Linked Products
  const [upsellIds, setUpsellIds] = useState<string[]>([]);
  const [crossSellIds, setCrossSellIds] = useState<string[]>([]);

  // Attributes
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);

  // Variations
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  // Downloadable Files
  const [downloadFiles, setDownloadFiles] = useState<DownloadableFile[]>([]);
  const [downloadLimit, setDownloadLimit] = useState<string>('');
  const [downloadExpiryDays, setDownloadExpiryDays] = useState<string>('');

  // Advanced Tab
  const [purchaseNote, setPurchaseNote] = useState('');

  // Sidebar / Publishing
  const [status, setStatus] = useState<'active' | 'archived' | 'draft'>('active');
  const [featured, setFeatured] = useState(false);
  const [catalogVisibility, setCatalogVisibility] = useState<'visible' | 'catalog' | 'search' | 'hidden'>('visible');
  const [category, setCategory] = useState('Books');
  const [categoriesList, setCategoriesList] = useState<string[]>(PRESET_CATEGORIES);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [image, setImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [galleryInput, setGalleryInput] = useState('');

  // Reset or Populate form when product changes
  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setSlug(product.slug || '');
      setShortDescription(product.shortDescription || '');
      setDescription(product.description || '');
      setProductType(product.productType || 'simple');
      setIsVirtual(Boolean(product.isVirtual));
      setIsDownloadable(Boolean(product.isDownloadable || product.productType === 'digital'));

      setRegularPrice(product.price ? product.price.toString() : '0');
      setSalePrice(product.discountPrice || product.salePrice ? (product.discountPrice || product.salePrice)!.toString() : '');
      setSaleStartDate(product.saleStartDate || '');
      setSaleEndDate(product.saleEndDate || '');
      setSku(product.sku || '');

      setManageStock(product.manageStock !== undefined ? product.manageStock : true);
      setStockQuantity(product.stock !== undefined ? product.stock.toString() : '50');
      setStockStatus(product.stockStatus || 'instock');
      setAllowBackorders(product.allowBackorders || 'no');
      setLowStockThreshold(product.lowStockThreshold ? product.lowStockThreshold.toString() : '5');
      setSoldIndividually(Boolean(product.soldIndividually));

      setWeightKg(product.weightKg ? product.weightKg.toString() : '');
      setLengthCm(product.dimensions?.length ? product.dimensions.length.toString() : '');
      setWidthCm(product.dimensions?.width ? product.dimensions.width.toString() : '');
      setHeightCm(product.dimensions?.height ? product.dimensions.height.toString() : '');
      setShippingClass(product.shippingClass || 'standard');

      setUpsellIds(product.upsellIds || []);
      setCrossSellIds(product.crossSellIds || []);

      setAttributes(product.attributes ? JSON.parse(JSON.stringify(product.attributes)) : []);
      setVariations(product.variations ? JSON.parse(JSON.stringify(product.variations)) : []);

      setDownloadFiles(product.downloadFiles || (product.downloadUrl ? [{ id: 'd1', name: 'Main File', url: product.downloadUrl }] : []));
      setDownloadLimit(product.downloadLimit ? product.downloadLimit.toString() : '');
      setDownloadExpiryDays(product.downloadExpiryDays ? product.downloadExpiryDays.toString() : '');

      setPurchaseNote(product.purchaseNote || '');

      setStatus(product.status || 'active');
      setFeatured(Boolean(product.featured));
      setCatalogVisibility(product.catalogVisibility || 'visible');
      setCategory(product.category || 'Books');
      setTags(product.tags || []);
      setImage(product.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop');
      setGallery(product.gallery || []);
    } else {
      // New product defaults
      setTitle('');
      setSlug('');
      setShortDescription('');
      setDescription('');
      setProductType('simple');
      setIsVirtual(false);
      setIsDownloadable(false);

      setRegularPrice('299');
      setSalePrice('');
      setSaleStartDate('');
      setSaleEndDate('');
      setSku(`SS-RES-${Math.floor(1000 + Math.random() * 9000)}`);

      setManageStock(true);
      setStockQuantity('50');
      setStockStatus('instock');
      setAllowBackorders('no');
      setLowStockThreshold('5');
      setSoldIndividually(false);

      setWeightKg('0.3');
      setLengthCm('21');
      setWidthCm('14');
      setHeightCm('1.5');
      setShippingClass('standard');

      setUpsellIds([]);
      setCrossSellIds([]);
      setAttributes([]);
      setVariations([]);
      setDownloadFiles([]);
      setDownloadLimit('');
      setDownloadExpiryDays('');
      setPurchaseNote('');

      setStatus('active');
      setFeatured(false);
      setCatalogVisibility('visible');
      setCategory('Books');
      setTags(['Spiritual Growth', 'Pastor Samuel Soren']);
      setImage('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop');
      setGallery([]);
    }
    setErrorMessage('');
    setSuccessMessage('');
  }, [product, isOpen]);

  if (!isOpen) return null;

  // Auto-generate slug from title if empty
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  // Attributes Handlers
  const handleAddAttribute = () => {
    const newAttr: ProductAttribute = {
      id: `attr_${Date.now()}`,
      name: '',
      values: [],
      visibleOnProductPage: true,
      usedForVariations: productType === 'variable'
    };
    setAttributes([...attributes, newAttr]);
  };

  const handleUpdateAttributeName = (id: string, name: string) => {
    setAttributes(attributes.map((a) => (a.id === id ? { ...a, name } : a)));
  };

  const handleUpdateAttributeValues = (id: string, text: string) => {
    const vals = text.split(/[,|]/).map((s) => s.trim()).filter(Boolean);
    setAttributes(attributes.map((a) => (a.id === id ? { ...a, values: vals } : a)));
  };

  const handleToggleAttrVariation = (id: string) => {
    setAttributes(
      attributes.map((a) => (a.id === id ? { ...a, usedForVariations: !a.usedForVariations } : a))
    );
  };

  const handleToggleAttrVisible = (id: string) => {
    setAttributes(
      attributes.map((a) => (a.id === id ? { ...a, visibleOnProductPage: !a.visibleOnProductPage } : a))
    );
  };

  const handleRemoveAttribute = (id: string) => {
    setAttributes(attributes.filter((a) => a.id !== id));
  };

  // Variations Handlers
  const handleAddVariation = () => {
    const newVar: ProductVariation = {
      id: `var_${Date.now()}`,
      title: 'Custom Variation',
      sku: `${sku || 'SS-PROD'}-V${variations.length + 1}`,
      price: Number(regularPrice) || 299,
      salePrice: salePrice ? Number(salePrice) : undefined,
      stock: 25,
      stockStatus: 'instock',
      attributes: {}
    };
    setVariations([...variations, newVar]);
  };

  const handleGenerateVariationsFromAttributes = () => {
    const variationAttrs = attributes.filter((a) => a.usedForVariations && a.values.length > 0);
    if (variationAttrs.length === 0) {
      alert('Please add at least one attribute marked "Used for variations" with values before generating variations.');
      return;
    }

    const firstAttr = variationAttrs[0];
    const generated: ProductVariation[] = firstAttr.values.map((val, idx) => ({
      id: `var_gen_${idx}_${Date.now()}`,
      title: val,
      sku: `${sku || 'SS-PROD'}-${val.substring(0, 3).toUpperCase()}`,
      price: Number(regularPrice) || 299,
      salePrice: salePrice ? Number(salePrice) : undefined,
      stock: 30,
      stockStatus: 'instock',
      attributes: { [firstAttr.name]: val }
    }));

    setVariations(generated);
  };

  const handleUpdateVariation = (id: string, field: keyof ProductVariation, value: any) => {
    setVariations(variations.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  const handleRemoveVariation = (id: string) => {
    setVariations(variations.filter((v) => v.id !== id));
  };

  // Downloadable Files Handlers
  const handleAddDownloadFile = () => {
    const newFile: DownloadableFile = {
      id: `file_${Date.now()}`,
      name: 'Resource PDF / Audio File',
      url: ''
    };
    setDownloadFiles([...downloadFiles, newFile]);
  };

  const handleUpdateDownloadFile = (id: string, field: 'name' | 'url', val: string) => {
    setDownloadFiles(downloadFiles.map((f) => (f.id === id ? { ...f, [field]: val } : f)));
  };

  const handleRemoveDownloadFile = (id: string) => {
    setDownloadFiles(downloadFiles.filter((f) => f.id !== id));
  };

  // Tags Handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  // Category Add
  const handleAddNewCategory = () => {
    if (newCategoryInput.trim() && !categoriesList.includes(newCategoryInput.trim())) {
      const updated = [...categoriesList, newCategoryInput.trim()];
      setCategoriesList(updated);
      setCategory(newCategoryInput.trim());
      setNewCategoryInput('');
    }
  };

  // Gallery Add
  const handleAddGalleryImage = () => {
    if (galleryInput.trim() && !gallery.includes(galleryInput.trim())) {
      setGallery([...gallery, galleryInput.trim()]);
      setGalleryInput('');
    }
  };

  const handleRemoveGalleryImage = (url: string) => {
    setGallery(gallery.filter((g) => g !== url));
  };

  // Save Product
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Product name / title is required.');
      return;
    }
    if (!regularPrice || isNaN(Number(regularPrice))) {
      setErrorMessage('Please enter a valid regular price in INR.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const token = localStorage.getItem('samuel_soren_token') || 'demo_super_token';

    const payload: Partial<Product> = {
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      price: Number(regularPrice),
      discountPrice: salePrice && Number(salePrice) > 0 ? Number(salePrice) : undefined,
      salePrice: salePrice && Number(salePrice) > 0 ? Number(salePrice) : undefined,
      saleStartDate: saleStartDate || undefined,
      saleEndDate: saleEndDate || undefined,
      sku: sku.trim() || `SS-${category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      image: image.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      gallery,
      category,
      tags,
      stock: Number(stockQuantity) || 0,
      manageStock,
      stockStatus,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      allowBackorders,
      soldIndividually,
      weightKg: weightKg ? Number(weightKg) : undefined,
      dimensions: {
        length: Number(lengthCm) || 0,
        width: Number(widthCm) || 0,
        height: Number(heightCm) || 0
      },
      shippingClass,
      productType,
      isVirtual,
      isDownloadable,
      downloadUrl: downloadFiles.length > 0 ? downloadFiles[0].url : '',
      downloadFiles,
      downloadLimit: downloadLimit ? Number(downloadLimit) : undefined,
      downloadExpiryDays: downloadExpiryDays ? Number(downloadExpiryDays) : undefined,
      featured,
      catalogVisibility,
      status,
      attributes,
      variations,
      upsellIds,
      crossSellIds,
      purchaseNote: purchaseNote.trim()
    };

    try {
      const url = isEditing ? `/api/admin/products/${product!.id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product in WooCommerce catalog.');
      }

      setSuccessMessage('Product published and synchronized with store inventory!');
      onSave(data);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-neutral-100 rounded-lg max-w-5xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[95vh] border border-neutral-300">
        
        {/* Top Header Bar */}
        <div className="bg-[#30203D] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#C83338] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#C83338] flex items-center justify-center text-white font-bold text-sm">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C83338] bg-white/10 px-2 py-0.5 rounded">
                  WooCommerce Product Manager
                </span>
                {isEditing && (
                  <span className="text-[10px] text-neutral-300 font-mono">
                    ID: {product?.id}
                  </span>
                )}
              </div>
              <h2 className="font-heading font-black text-lg sm:text-xl uppercase tracking-wide">
                {isEditing ? `Edit Product: ${product?.title}` : 'Add New WooCommerce Product'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {errorMessage && (
            <div className="p-3 bg-red-100 border-l-4 border-red-600 text-red-800 text-xs rounded flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-100 border-l-4 border-green-600 text-green-800 text-xs rounded flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Main Product Info & WooCommerce Data Tabs */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Product Title & Permalink */}
              <div className="bg-white p-4 rounded border border-neutral-300 space-y-3 shadow-xs">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Walking in Divine Purpose (Deluxe Hardcover)"
                    className="w-full p-2.5 text-sm font-semibold border border-neutral-300 rounded focus:border-[#C83338] focus:ring-1 focus:ring-[#C83338] outline-hidden"
                  />
                </div>

                <div className="flex items-center text-xs text-neutral-500 gap-1.5">
                  <span className="font-semibold text-neutral-400">Permalink:</span>
                  <span className="text-neutral-500 font-mono text-[11px] truncate">
                    /shop/{slug || 'product-slug'}
                  </span>
                </div>
              </div>

              {/* Product Short Description */}
              <div className="bg-white p-4 rounded border border-neutral-300 space-y-2 shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Product Short Description (Summary displayed next to price)
                </label>
                <textarea
                  rows={2}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A concise, compelling overview highlighting the book or resource's core message..."
                  className="w-full p-2.5 text-xs border border-neutral-300 rounded focus:border-[#C83338] focus:ring-1 focus:ring-[#C83338] outline-hidden"
                />
              </div>

              {/* Product Full Description */}
              <div className="bg-white p-4 rounded border border-neutral-300 space-y-2 shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Product Long Description &amp; Table of Contents
                </label>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive description, chapter breakdowns, author endorsements, scripture foundations..."
                  className="w-full p-2.5 text-xs border border-neutral-300 rounded focus:border-[#C83338] focus:ring-1 focus:ring-[#C83338] outline-hidden"
                />
              </div>

              {/* THE ICONIC WOOCOMMERCE PRODUCT DATA BOX */}
              <div className="bg-white rounded border border-neutral-300 overflow-hidden shadow-xs">
                
                {/* Meta Box Header */}
                <div className="bg-neutral-50 p-3 border-b border-neutral-300 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-700">
                      Product Data —
                    </span>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value as any)}
                      className="text-xs font-bold bg-white border border-neutral-300 rounded px-2.5 py-1 text-[#30203D] focus:border-[#C83338] outline-hidden"
                    >
                      <option value="simple">Simple product</option>
                      <option value="variable">Variable product</option>
                      <option value="digital">Digital / Downloadable</option>
                      <option value="grouped">Grouped / Bundle product</option>
                      <option value="virtual">Virtual product</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-semibold text-neutral-600">
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isVirtual}
                        onChange={(e) => setIsVirtual(e.target.checked)}
                        className="rounded border-neutral-300 text-[#C83338] focus:ring-[#C83338]"
                      />
                      <span>Virtual</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDownloadable}
                        onChange={(e) => setIsDownloadable(e.target.checked)}
                        className="rounded border-neutral-300 text-[#C83338] focus:ring-[#C83338]"
                      />
                      <span>Downloadable</span>
                    </label>
                  </div>
                </div>

                {/* Vertical Tabs & Content Layout */}
                <div className="flex flex-col sm:flex-row min-h-[320px]">
                  
                  {/* Left Tab Buttons */}
                  <div className="w-full sm:w-44 bg-neutral-50 border-r border-neutral-200 divide-y divide-neutral-200 shrink-0 text-xs font-semibold text-neutral-600">
                    <button
                      type="button"
                      onClick={() => setActiveTab('general')}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2 transition ${
                        activeTab === 'general' ? 'bg-white text-[#C83338] font-bold border-l-4 border-l-[#C83338]' : 'hover:bg-neutral-100'
                      }`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>General</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('inventory')}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2 transition ${
                        activeTab === 'inventory' ? 'bg-white text-[#C83338] font-bold border-l-4 border-l-[#C83338]' : 'hover:bg-neutral-100'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Inventory</span>
                    </button>

                    {!isVirtual && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('shipping')}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2 transition ${
                          activeTab === 'shipping' ? 'bg-white text-[#C83338] font-bold border-l-4 border-l-[#C83338]' : 'hover:bg-neutral-100'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Shipping</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveTab('linked')}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2 transition ${
                        activeTab === 'linked' ? 'bg-white text-[#C83338] font-bold border-l-4 border-l-[#C83338]' : 'hover:bg-neutral-100'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Linked Products</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('attributes')}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2 transition ${
                        activeTab === 'attributes' ? 'bg-white text-[#C83338] font-bold border-l-4 border-l-[#C83338]' : 'hover:bg-neutral-100'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Attributes</span>
                    </button>

                    {productType === 'variable' && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('variations')}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2 transition ${
                          activeTab === 'variations' ? 'bg-white text-[#C83338] font-bold border-l-4 border-l-[#C83338]' : 'hover:bg-neutral-100'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-bold">Variations ({variations.length})</span>
                      </button>
                    )}

                    {(isDownloadable || productType === 'digital') && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('downloads')}
                        className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2 transition ${
                          activeTab === 'downloads' ? 'bg-white text-[#C83338] font-bold border-l-4 border-l-[#C83338]' : 'hover:bg-neutral-100'
                        }`}
                      >
                        <FileDown className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Downloadable</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveTab('advanced')}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center space-x-2 transition ${
                        activeTab === 'advanced' ? 'bg-white text-[#C83338] font-bold border-l-4 border-l-[#C83338]' : 'hover:bg-neutral-100'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Advanced</span>
                    </button>
                  </div>

                  {/* Right Tab Content */}
                  <div className="flex-1 p-5 bg-white space-y-4">
                    
                    {/* 1. GENERAL TAB */}
                    {activeTab === 'general' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1">
                              Regular Price (₹ INR) <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              required
                              value={regularPrice}
                              onChange={(e) => setRegularPrice(e.target.value)}
                              placeholder="399"
                              className="w-full p-2 text-xs border border-neutral-300 rounded focus:border-[#C83338] outline-hidden font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1">
                              Sale Price (₹ INR)
                            </label>
                            <input
                              type="number"
                              value={salePrice}
                              onChange={(e) => setSalePrice(e.target.value)}
                              placeholder="299 (Optional promotional price)"
                              className="w-full p-2 text-xs border border-neutral-300 rounded focus:border-[#C83338] outline-hidden font-bold text-[#C83338]"
                            />
                          </div>
                        </div>

                        {/* Sale Price Schedule */}
                        <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-2">
                          <span className="text-[11px] font-bold text-neutral-600 uppercase">
                            Sale Schedule (Optional):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <span className="text-[10px] text-neutral-500 block mb-0.5">From Date:</span>
                              <input
                                type="date"
                                value={saleStartDate}
                                onChange={(e) => setSaleStartDate(e.target.value)}
                                className="w-full p-1.5 text-xs border border-neutral-300 rounded bg-white outline-hidden"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-neutral-500 block mb-0.5">To Date:</span>
                              <input
                                type="date"
                                value={saleEndDate}
                                onChange={(e) => setSaleEndDate(e.target.value)}
                                className="w-full p-1.5 text-xs border border-neutral-300 rounded bg-white outline-hidden"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            SKU (Stock Keeping Unit)
                          </label>
                          <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="e.g. SS-BOK-1001"
                            className="w-full p-2 text-xs font-mono border border-neutral-300 rounded focus:border-[#C83338] outline-hidden"
                          />
                        </div>
                      </div>
                    )}

                    {/* 2. INVENTORY TAB */}
                    {activeTab === 'inventory' && (
                      <div className="space-y-4">
                        <label className="flex items-center space-x-2 text-xs font-bold text-neutral-800 cursor-pointer p-2 bg-neutral-50 rounded border border-neutral-200">
                          <input
                            type="checkbox"
                            checked={manageStock}
                            onChange={(e) => setManageStock(e.target.checked)}
                            className="w-4 h-4 text-[#C83338] rounded border-neutral-300 focus:ring-[#C83338]"
                          />
                          <span>Manage stock level (quantity)</span>
                        </label>

                        {manageStock ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-neutral-700 mb-1">
                                Stock Quantity
                              </label>
                              <input
                                type="number"
                                value={stockQuantity}
                                onChange={(e) => setStockQuantity(e.target.value)}
                                placeholder="50"
                                className="w-full p-2 text-xs border border-neutral-300 rounded focus:border-[#C83338] outline-hidden font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-neutral-700 mb-1">
                                Low Stock Threshold
                              </label>
                              <input
                                type="number"
                                value={lowStockThreshold}
                                onChange={(e) => setLowStockThreshold(e.target.value)}
                                placeholder="5"
                                className="w-full p-2 text-xs border border-neutral-300 rounded focus:border-[#C83338] outline-hidden"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-neutral-700 mb-1">
                                Allow Backorders?
                              </label>
                              <select
                                value={allowBackorders}
                                onChange={(e) => setAllowBackorders(e.target.value as any)}
                                className="w-full p-2 text-xs border border-neutral-300 rounded bg-white outline-hidden"
                              >
                                <option value="no">Do not allow</option>
                                <option value="notify">Allow, but notify customer</option>
                                <option value="yes">Allow</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-neutral-700 mb-1">
                                Stock Status
                              </label>
                              <select
                                value={stockStatus}
                                onChange={(e) => setStockStatus(e.target.value as any)}
                                className="w-full p-2 text-xs border border-neutral-300 rounded bg-white outline-hidden"
                              >
                                <option value="instock">In stock</option>
                                <option value="outofstock">Out of stock</option>
                                <option value="onbackorder">On backorder</option>
                              </select>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1">
                              Stock Status
                            </label>
                            <select
                              value={stockStatus}
                              onChange={(e) => setStockStatus(e.target.value as any)}
                              className="w-full p-2 text-xs border border-neutral-300 rounded bg-white outline-hidden"
                            >
                              <option value="instock">In stock</option>
                              <option value="outofstock">Out of stock</option>
                              <option value="onbackorder">On backorder</option>
                            </select>
                          </div>
                        )}

                        <div className="pt-2 border-t border-neutral-200">
                          <label className="flex items-center space-x-2 text-xs text-neutral-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={soldIndividually}
                              onChange={(e) => setSoldIndividually(e.target.checked)}
                              className="rounded border-neutral-300 text-[#C83338] focus:ring-[#C83338]"
                            />
                            <span>Sold individually (Limit purchases to 1 item per order)</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* 3. SHIPPING TAB */}
                    {activeTab === 'shipping' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Weight (kg)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={weightKg}
                            onChange={(e) => setWeightKg(e.target.value)}
                            placeholder="0.35"
                            className="w-full p-2 text-xs border border-neutral-300 rounded focus:border-[#C83338] outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Dimensions (cm)
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="number"
                              step="0.1"
                              value={lengthCm}
                              onChange={(e) => setLengthCm(e.target.value)}
                              placeholder="Length (21)"
                              className="p-2 text-xs border border-neutral-300 rounded outline-hidden"
                            />
                            <input
                              type="number"
                              step="0.1"
                              value={widthCm}
                              onChange={(e) => setWidthCm(e.target.value)}
                              placeholder="Width (14)"
                              className="p-2 text-xs border border-neutral-300 rounded outline-hidden"
                            />
                            <input
                              type="number"
                              step="0.1"
                              value={heightCm}
                              onChange={(e) => setHeightCm(e.target.value)}
                              placeholder="Height (1.8)"
                              className="p-2 text-xs border border-neutral-300 rounded outline-hidden"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-700 mb-1">
                            Shipping Class
                          </label>
                          <select
                            value={shippingClass}
                            onChange={(e) => setShippingClass(e.target.value)}
                            className="w-full p-2 text-xs border border-neutral-300 rounded bg-white outline-hidden"
                          >
                            <option value="standard">Standard India Post / Courier (₹50, Free over ₹500)</option>
                            <option value="express">Speed Post Express (₹120)</option>
                            <option value="heavy">Heavy Church Bulk Shipping (₹250)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {/* 4. LINKED PRODUCTS TAB */}
                    {activeTab === 'linked' && (
                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-neutral-700 mb-1">
                            Up-sells (Recommend premium alternative editions):
                          </label>
                          <select
                            multiple
                            value={upsellIds}
                            onChange={(e) => {
                              const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                              setUpsellIds(opts);
                            }}
                            className="w-full p-2 border border-neutral-300 rounded bg-white h-28"
                          >
                            {allProducts
                              .filter((p) => p.id !== product?.id)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.title} (₹{p.discountPrice || p.price})
                                </option>
                              ))}
                          </select>
                          <span className="text-[10px] text-neutral-400">Hold Ctrl / Cmd to select multiple</span>
                        </div>

                        <div>
                          <label className="block font-bold text-neutral-700 mb-1">
                            Cross-sells (Frequently bought together in cart):
                          </label>
                          <select
                            multiple
                            value={crossSellIds}
                            onChange={(e) => {
                              const opts = Array.from(e.target.selectedOptions, (o) => o.value);
                              setCrossSellIds(opts);
                            }}
                            className="w-full p-2 border border-neutral-300 rounded bg-white h-28"
                          >
                            {allProducts
                              .filter((p) => p.id !== product?.id)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.title} (₹{p.discountPrice || p.price})
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* 5. ATTRIBUTES TAB */}
                    {activeTab === 'attributes' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-700">
                            Custom Product Attributes (e.g. Format, Language, Cover Type)
                          </span>
                          <button
                            type="button"
                            onClick={handleAddAttribute}
                            className="px-2.5 py-1 bg-neutral-900 text-white rounded text-xs font-bold flex items-center gap-1 hover:bg-[#C83338] transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Attribute</span>
                          </button>
                        </div>

                        {attributes.length === 0 ? (
                          <div className="p-6 text-center border-2 border-dashed border-neutral-300 rounded text-xs text-neutral-500 space-y-2">
                            <Sliders className="w-8 h-8 text-neutral-400 mx-auto" />
                            <p>No attributes configured yet.</p>
                            <p className="text-[11px] text-neutral-400">
                              Click "+ Add Attribute" to define custom attributes like Format (Paperback, Hardcover) or Language (Santali, Hindi).
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {attributes.map((attr, idx) => (
                              <div key={attr.id} className="p-3 border border-neutral-300 rounded bg-neutral-50 space-y-2 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <input
                                    type="text"
                                    value={attr.name}
                                    onChange={(e) => handleUpdateAttributeName(attr.id, e.target.value)}
                                    placeholder="Attribute Name (e.g. Format, Language)"
                                    className="p-1.5 border border-neutral-300 rounded font-bold bg-white w-48 text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAttribute(attr.id)}
                                    className="text-neutral-400 hover:text-red-600 p-1"
                                    title="Remove Attribute"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div>
                                  <label className="block text-[11px] font-semibold text-neutral-600 mb-0.5">
                                    Values (separate with | or comma):
                                  </label>
                                  <input
                                    type="text"
                                    value={attr.values.join(' | ')}
                                    onChange={(e) => handleUpdateAttributeValues(attr.id, e.target.value)}
                                    placeholder="Paperback | Hardcover | PDF eBook"
                                    className="w-full p-2 border border-neutral-300 rounded bg-white text-xs font-mono"
                                  />
                                </div>

                                <div className="flex items-center gap-4 text-[11px] pt-1">
                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={attr.visibleOnProductPage}
                                      onChange={() => handleToggleAttrVisible(attr.id)}
                                      className="rounded text-[#C83338]"
                                    />
                                    <span>Visible on the product page</span>
                                  </label>

                                  <label className="flex items-center gap-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={attr.usedForVariations}
                                      onChange={() => handleToggleAttrVariation(attr.id)}
                                      className="rounded text-[#C83338]"
                                    />
                                    <span className="font-bold text-[#C83338]">Used for variations</span>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 6. VARIATIONS TAB */}
                    {activeTab === 'variations' && productType === 'variable' && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                          <div>
                            <span className="text-xs font-bold text-amber-900 block">
                              Variable Product Variations
                            </span>
                            <span className="text-[11px] text-amber-700">
                              Each variation can have its own price, SKU, and stock count.
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={handleGenerateVariationsFromAttributes}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition shadow-xs"
                            >
                              Generate from Attributes
                            </button>
                            <button
                              type="button"
                              onClick={handleAddVariation}
                              className="px-2.5 py-1 bg-neutral-900 hover:bg-[#C83338] text-white rounded text-xs font-bold transition"
                            >
                              + Add Variation
                            </button>
                          </div>
                        </div>

                        {variations.length === 0 ? (
                          <div className="p-8 text-center border-2 border-dashed border-neutral-300 rounded text-xs text-neutral-500 space-y-2">
                            <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
                            <p className="font-semibold">No variations added yet.</p>
                            <p className="text-[11px] text-neutral-400 max-w-sm mx-auto">
                              Click "Generate from Attributes" to automatically create variations for Paperback, Hardcover, eBook, or add one manually.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {variations.map((v) => (
                              <div key={v.id} className="p-3 border border-neutral-300 rounded bg-neutral-50 space-y-3 text-xs">
                                <div className="flex items-center justify-between border-b pb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-neutral-800">
                                      #{v.title || 'Variation'}
                                    </span>
                                    {v.attributes &&
                                      Object.entries(v.attributes).map(([ak, av]) => (
                                        <span key={ak} className="bg-red-50 text-[#C83338] px-1.5 py-0.5 rounded text-[10px] font-bold">
                                          {ak}: {av}
                                        </span>
                                      ))}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariation(v.id)}
                                    className="text-neutral-400 hover:text-red-600 p-1"
                                    title="Delete variation"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  <div>
                                    <span className="text-[10px] text-neutral-500 block">Variation Title</span>
                                    <input
                                      type="text"
                                      value={v.title}
                                      onChange={(e) => handleUpdateVariation(v.id, 'title', e.target.value)}
                                      placeholder="Deluxe Hardcover"
                                      className="w-full p-1.5 border border-neutral-300 rounded bg-white text-xs"
                                    />
                                  </div>

                                  <div>
                                    <span className="text-[10px] text-neutral-500 block">SKU</span>
                                    <input
                                      type="text"
                                      value={v.sku || ''}
                                      onChange={(e) => handleUpdateVariation(v.id, 'sku', e.target.value)}
                                      placeholder="SS-BOK-HC"
                                      className="w-full p-1.5 border border-neutral-300 rounded bg-white text-xs font-mono"
                                    />
                                  </div>

                                  <div>
                                    <span className="text-[10px] text-neutral-500 block">Price (₹)</span>
                                    <input
                                      type="number"
                                      value={v.price}
                                      onChange={(e) => handleUpdateVariation(v.id, 'price', Number(e.target.value))}
                                      placeholder="499"
                                      className="w-full p-1.5 border border-neutral-300 rounded bg-white text-xs font-bold"
                                    />
                                  </div>

                                  <div>
                                    <span className="text-[10px] text-neutral-500 block">Stock Qty</span>
                                    <input
                                      type="number"
                                      value={v.stock}
                                      onChange={(e) => handleUpdateVariation(v.id, 'stock', Number(e.target.value))}
                                      placeholder="25"
                                      className="w-full p-1.5 border border-neutral-300 rounded bg-white text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* 7. DOWNLOADABLE FILES TAB */}
                    {activeTab === 'downloads' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-700">
                            Downloadable Digital Files
                          </span>
                          <button
                            type="button"
                            onClick={handleAddDownloadFile}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add File</span>
                          </button>
                        </div>

                        {downloadFiles.length === 0 ? (
                          <div className="p-6 text-center border-2 border-dashed border-neutral-300 rounded text-xs text-neutral-500 space-y-1">
                            <FileDown className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                            <p>No downloadable files added.</p>
                            <p className="text-[11px] text-neutral-400">
                              Customers who purchase this product will receive instant download access upon verified payment.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {downloadFiles.map((file) => (
                              <div key={file.id} className="p-3 bg-neutral-50 border border-neutral-300 rounded space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                  <input
                                    type="text"
                                    value={file.name}
                                    onChange={(e) => handleUpdateDownloadFile(file.id, 'name', e.target.value)}
                                    placeholder="File Name (e.g. Anointed-Worship-Live.mp3)"
                                    className="p-1.5 border border-neutral-300 rounded bg-white font-bold w-1/2"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveDownloadFile(file.id)}
                                    className="text-neutral-400 hover:text-red-600 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <input
                                  type="url"
                                  value={file.url}
                                  onChange={(e) => handleUpdateDownloadFile(file.id, 'url', e.target.value)}
                                  placeholder="https://example.com/downloads/file.pdf"
                                  className="w-full p-1.5 border border-neutral-300 rounded bg-white font-mono text-[11px]"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1">
                              Download Limit
                            </label>
                            <input
                              type="number"
                              value={downloadLimit}
                              onChange={(e) => setDownloadLimit(e.target.value)}
                              placeholder="Leave blank for unlimited"
                              className="w-full p-2 text-xs border border-neutral-300 rounded outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-neutral-700 mb-1">
                              Download Expiry (Days)
                            </label>
                            <input
                              type="number"
                              value={downloadExpiryDays}
                              onChange={(e) => setDownloadExpiryDays(e.target.value)}
                              placeholder="Leave blank for never"
                              className="w-full p-2 text-xs border border-neutral-300 rounded outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 8. ADVANCED TAB */}
                    {activeTab === 'advanced' && (
                      <div className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-neutral-700 mb-1">
                            Purchase Note
                          </label>
                          <textarea
                            rows={3}
                            value={purchaseNote}
                            onChange={(e) => setPurchaseNote(e.target.value)}
                            placeholder="An optional pastoral message or instructions dispatched to the customer on order completion..."
                            className="w-full p-2 border border-neutral-300 rounded outline-hidden"
                          />
                        </div>

                        <div className="p-3 bg-neutral-50 rounded border border-neutral-200">
                          <label className="flex items-center space-x-2 text-xs font-bold text-neutral-700 cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded text-[#C83338]"
                            />
                            <span>Enable Customer Reviews &amp; Star Ratings</span>
                          </label>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: WooCommerce Sidebars (Publish, Categories, Tags, Image, Gallery) */}
            <div className="space-y-5">
              
              {/* PUBLISH META BOX */}
              <div className="bg-white rounded border border-neutral-300 p-4 space-y-4 shadow-xs">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="font-heading font-black text-xs uppercase tracking-wider text-neutral-800">
                    Publish
                  </h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${status === 'active' ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-700'}`}>
                    {status}
                  </span>
                </div>

                <div className="space-y-3 text-xs text-neutral-600">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="border border-neutral-300 rounded p-1 text-xs bg-white font-semibold"
                    >
                      <option value="active">Published / Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Catalog Visibility:</span>
                    <select
                      value={catalogVisibility}
                      onChange={(e) => setCatalogVisibility(e.target.value as any)}
                      className="border border-neutral-300 rounded p-1 text-xs bg-white"
                    >
                      <option value="visible">Shop & Search</option>
                      <option value="catalog">Shop only</option>
                      <option value="search">Search only</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="rounded text-[#C83338] border-neutral-300"
                    />
                    <span className="font-bold text-neutral-800">Featured product badge</span>
                  </label>
                </div>

                <div className="pt-3 border-t flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#C83338] hover:bg-[#a62529] text-white text-xs font-bold uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Publish Product'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-2 border border-neutral-300 text-neutral-600 text-xs font-semibold rounded hover:bg-neutral-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* PRODUCT IMAGE META BOX */}
              <div className="bg-white rounded border border-neutral-300 p-4 space-y-3 shadow-xs">
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-neutral-800 border-b pb-2">
                  Product Featured Image
                </h3>
                
                {image ? (
                  <div className="relative aspect-4/3 rounded border overflow-hidden bg-neutral-100 group">
                    <img src={image} alt="Product preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 p-1 bg-black/70 text-white rounded hover:bg-red-600 transition"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center border-2 border-dashed border-neutral-300 rounded text-xs text-neutral-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1 text-neutral-300" />
                    <span>No image set</span>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Image URL:
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-1.5 text-xs border border-neutral-300 rounded font-mono outline-hidden"
                  />
                </div>
              </div>

              {/* PRODUCT GALLERY META BOX */}
              <div className="bg-white rounded border border-neutral-300 p-4 space-y-3 shadow-xs">
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-neutral-800 border-b pb-2">
                  Product Gallery
                </h3>

                {gallery.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {gallery.map((gurl, gidx) => (
                      <div key={gidx} className="relative aspect-square rounded border overflow-hidden group">
                        <img src={gurl} alt={`Gallery ${gidx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(gurl)}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    placeholder="Add gallery photo URL..."
                    className="flex-1 p-1.5 text-xs border border-neutral-300 rounded outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddGalleryImage}
                    className="px-2.5 py-1 bg-neutral-900 text-white text-xs font-bold rounded hover:bg-[#C83338]"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* PRODUCT CATEGORIES META BOX */}
              <div className="bg-white rounded border border-neutral-300 p-4 space-y-3 shadow-xs">
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-neutral-800 border-b pb-2">
                  Product Categories
                </h3>

                <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs">
                  {categoriesList.map((cat) => (
                    <label key={cat} className="flex items-center space-x-2 cursor-pointer hover:bg-neutral-50 p-1 rounded">
                      <input
                        type="radio"
                        name="productCategory"
                        checked={category === cat}
                        onChange={() => setCategory(cat)}
                        className="text-[#C83338] focus:ring-[#C83338]"
                      />
                      <span className={category === cat ? 'font-bold text-[#C83338]' : 'text-neutral-700'}>
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>

                <div className="pt-2 border-t flex gap-1.5">
                  <input
                    type="text"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    placeholder="+ New category..."
                    className="flex-1 p-1.5 text-xs border border-neutral-300 rounded outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="px-2 py-1 bg-neutral-100 border text-neutral-700 text-xs font-bold rounded hover:bg-neutral-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* PRODUCT TAGS META BOX */}
              <div className="bg-white rounded border border-neutral-300 p-4 space-y-3 shadow-xs">
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-neutral-800 border-b pb-2">
                  Product Tags
                </h3>

                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag (e.g. Worship, Devotional)..."
                    className="flex-1 p-1.5 text-xs border border-neutral-300 rounded outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-2.5 py-1 bg-neutral-900 text-white text-xs font-bold rounded hover:bg-[#C83338]"
                  >
                    Add
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-200"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-red-600"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
export default WooCommerceProductEditor;
