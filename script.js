// Load items on page load
document.addEventListener('DOMContentLoaded', loadItems);

// Sort functionality
document.getElementById('sortSelect')?.addEventListener('change', loadItems);

async function loadItems() {
    const itemsGrid = document.getElementById('itemsGrid');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const sortSelect = document.getElementById('sortSelect');
    
    if (!itemsGrid) return;
    
    // Show loading
    itemsGrid.innerHTML = '';
    loading.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    try {
        // Build query
        let query = supabase
            .from('items')
            .select('*');
        
        // Apply sorting
        if (sortSelect) {
            const sortBy = sortSelect.value;
            query = query.order('created_at', { ascending: sortBy === 'oldest' });
        } else {
            query = query.order('created_at', { ascending: false });
        }
        
        const { data: items, error } = await query;
        
        if (error) throw error;
        
        // Hide loading
        loading.classList.add('hidden');
        
        if (!items || items.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        // Render items
        items.forEach(item => {
            const itemCard = createItemCard(item);
            itemsGrid.appendChild(itemCard);
        });
        
    } catch (error) {
        console.error('Error loading items:', error);
        loading.classList.add('hidden');
        showToast('Error loading items', 'error');
    }
}

function createItemCard(item) {
    const timeAgo = getTimeAgo(item.created_at);
    
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl overflow-hidden card-shadow hover-scale';
    card.innerHTML = `
        <div class="relative overflow-hidden group">
            <img src="${item.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                 alt="${item.title}"
                 class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 m-2 rounded-full text-sm font-semibold">
                <i class="fas fa-clock mr-1"></i>${timeAgo}
            </div>
        </div>
        <div class="p-6">
            <h3 class="text-xl font-bold text-gray-800 mb-2 truncate">${item.title}</h3>
            <p class="text-gray-600 mb-4 line-clamp-2">${item.description || 'No description provided'}</p>
            <div class="flex justify-between items-center">
                <button onclick="viewItemDetail('${item.id}')" 
                        class="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition">
                    View Details
                </button>
                <span class="text-sm text-gray-500">
                    <i class="fas fa-whatsapp text-green-500 mr-1"></i>
                    WhatsApp Available
                </span>
            </div>
        </div>
    `;
    
    return card;
}

function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    
    return `${Math.floor(months / 12)}y ago`;
}

function viewItemDetail(itemId) {
    window.location.href = `item-detail.html?id=${itemId}`;
}

// Export functions for use in other pages
window.supabase = supabase;
window.showToast = showToast;
window.createItemCard = createItemCard;
window.getTimeAgo = getTimeAgo;
window.viewItemDetail = viewItemDetail;
window.loadItems = loadItems;
