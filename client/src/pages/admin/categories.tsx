import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Edit, Trash2, FolderTree, GripVertical, Save, X, ChevronRight, ChevronDown, Folder, FolderOpen, Search, Expand, Minimize2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createAuthenticatedRequest } from "@/lib/auth";
import type { Category } from "@shared/schema";
import React from "react";

// Helper type for tree structure
interface CategoryTree extends Category {
  children: CategoryTree[];
  level: number;
}

interface SortableCategoryProps {
  category: CategoryTree;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  expandedCategories: Set<string>;
  toggleExpanded: (id: string) => void;
  isPending?: boolean;
}

function SortableCategory({ category, onEdit, onDelete, onToggleActive, expandedCategories, toggleExpanded, isPending = false }: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isExpanded = expandedCategories.has(category.id);
  const hasChildren = category.children.length > 0;
  const isRootCategory = category.level === 0;

  return (
    <div ref={setNodeRef} style={style} className="mb-1">
      {/* Tree Connector Lines */}
      <div className="relative">
        {category.level > 0 && (
          <div 
            className="absolute top-0 right-0 w-px bg-border"
            style={{ 
              right: `${(category.level - 1) * 20 + 10}px`,
              height: '100%'
            }}
          />
        )}
        {category.level > 0 && (
          <div 
            className="absolute top-4 bg-border h-px"
            style={{ 
              right: `${(category.level - 1) * 20 + 10}px`,
              width: '10px'
            }}
          />
        )}
        
        <div 
          className={`flex items-center gap-2 p-2 border rounded-md transition-colors ${
            isRootCategory 
              ? 'bg-primary/5 border-primary/20 hover:bg-primary/10' 
              : 'bg-card hover:bg-muted/50'
          }`}
          style={{ marginRight: `${category.level * 20}px` }}
        >
          <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto w-4 h-4"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(category.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              data-testid={`button-toggle-${category.id}`}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          ) : (
            <div className="w-3 h-3" />
          )}
          
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className={`w-4 h-4 ${isRootCategory ? 'text-primary' : 'text-orange-500'}`} />
            ) : (
              <Folder className={`w-4 h-4 ${isRootCategory ? 'text-primary' : 'text-orange-500'}`} />
            )
          ) : (
            <FolderTree className="w-3 h-3 text-blue-500" />
          )}
          
          <div className="flex-1">
            <div className={`flex items-center gap-2 ${isRootCategory ? 'font-semibold text-sm' : 'font-medium text-sm'}`}>
              <span data-testid={`text-category-name-${category.id}`}>
                {category.name}
              </span>
              
              {/* Category Type Badge */}
              {isRootCategory && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-primary/10 text-primary border-primary/20 px-1 py-0"
                  data-testid={`badge-root-${category.id}`}
                >
                  اصلی
                </Badge>
              )}
              
              {/* Child Count Badge */}
              {hasChildren && (
                <Badge 
                  variant="secondary" 
                  className="text-xs px-1 py-0"
                  data-testid={`badge-child-count-${category.id}`}
                >
                  {category.children.length}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Active/Inactive Radio Buttons */}
            <div className="flex items-center gap-1" data-testid={`radio-group-status-${category.id}`}>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name={`status-${category.id}`}
                  checked={category.isActive}
                  onChange={(e) => {
                    e.stopPropagation();
                    // Direct inline status change without opening dialog
                    onToggleActive(category.id, true);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={isPending}
                  className="w-3 h-3"
                  data-testid={`radio-active-${category.id}`}
                />
                <span className="text-xs text-green-600">فعال</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name={`status-${category.id}`}
                  checked={!category.isActive}
                  onChange={(e) => {
                    e.stopPropagation();
                    // Direct inline status change without opening dialog
                    onToggleActive(category.id, false);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  disabled={isPending}
                  className="w-3 h-3"
                  data-testid={`radio-inactive-${category.id}`}
                />
                <span className="text-xs text-gray-500">غیرفعال</span>
              </label>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(category);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="h-6 w-6 p-0"
              data-testid={`button-edit-category-${category.id}`}
            >
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(category.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="h-6 w-6 p-0"
              data-testid={`button-delete-category-${category.id}`}
            >
              <Trash2 className="w-3 h-3 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Render children recursively */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {category.children.map((child) => (
            <SortableCategory
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
              expandedCategories={expandedCategories}
              toggleExpanded={toggleExpanded}
              isPending={isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Categories() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentId: null as string | null,
    order: 0,
    isActive: true,
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    // Default expand root categories
    const stored = localStorage.getItem('expandedCategories');
    if (stored) {
      return new Set(JSON.parse(stored));
    }
    return new Set();
  });
  const [searchFilter, setSearchFilter] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await createAuthenticatedRequest("/api/categories");
      if (!response.ok) throw new Error("خطا در دریافت دسته‌بندی‌ها");
      return response.json();
    },
  });

  // Helper function to build tree structure
  const buildCategoryTree = (categories: Category[], parentId: string | null = null, level: number = 0): CategoryTree[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .map(cat => ({
        ...cat,
        level,
        children: buildCategoryTree(categories, cat.id, level + 1)
      }));
  };

  // Helper function to flatten tree for drag & drop context
  const flattenTree = (tree: CategoryTree[]): CategoryTree[] => {
    const result: CategoryTree[] = [];
    const traverse = (nodes: CategoryTree[]) => {
      nodes.forEach(node => {
        result.push(node);
        if (expandedCategories.has(node.id) && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(tree);
    return result;
  };

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!searchFilter) return categories;
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchFilter.toLowerCase()))
    );
  }, [categories, searchFilter]);

  // Auto-expand categories that match search
  const getFilteredTree = React.useCallback((categories: Category[], parentId: string | null = null, level: number = 0): CategoryTree[] => {
    return categories
      .filter(cat => cat.parentId === parentId)
      .filter(cat => {
        if (!searchFilter) return true;
        // Include if matches or has matching children
        const matches = cat.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                       (cat.description && cat.description.toLowerCase().includes(searchFilter.toLowerCase()));
        const hasMatchingChildren = categories.some(child => 
          child.parentId === cat.id && 
          (child.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
           (child.description && child.description.toLowerCase().includes(searchFilter.toLowerCase())))
        );
        return matches || hasMatchingChildren;
      })
      .sort((a, b) => a.order - b.order)
      .map(cat => ({
        ...cat,
        level,
        children: getFilteredTree(categories, cat.id, level + 1)
      }));
  }, [searchFilter]);

  const categoryTree = searchFilter ? getFilteredTree(filteredCategories) : buildCategoryTree(categories);
  const flatCategories = flattenTree(categoryTree);

  // Auto-expand path to search results
  React.useEffect(() => {
    if (searchFilter && filteredCategories.length > 0) {
      const newExpanded = new Set(expandedCategories);
      // Expand all categories that have matching children
      categories.forEach(cat => {
        const hasMatchingDescendants = categories.some(child => 
          child.parentId === cat.id && 
          (child.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
           (child.description && child.description.toLowerCase().includes(searchFilter.toLowerCase())))
        );
        if (hasMatchingDescendants) {
          newExpanded.add(cat.id);
        }
      });
      setExpandedCategories(newExpanded);
    }
  }, [searchFilter, categories, expandedCategories]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await createAuthenticatedRequest("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("خطا در ایجاد دسته‌بندی");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setFormData({ 
        name: "", 
        description: "", 
        parentId: null,
        order: 0,
        isActive: true,
      });
      toast({ title: "دسته‌بندی با موفقیت ایجاد شد" });
    },
    onError: () => {
      toast({ title: "خطا در ایجاد دسته‌بندی", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
      const response = await createAuthenticatedRequest(`/api/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("خطا در بروزرسانی دسته‌بندی");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setEditingCategory(null);
      setIsEditDialogOpen(false);
      toast({ title: "دسته‌بندی با موفقیت بروزرسانی شد" });
    },
    onError: () => {
      toast({ title: "خطا در بروزرسانی دسته‌بندی", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await createAuthenticatedRequest(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("خطا در حذف دسته‌بندی");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "دسته‌بندی با موفقیت حذف شد" });
    },
    onError: () => {
      toast({ title: "خطا در حذف دسته‌بندی", variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { categoryId: string; newOrder: number; newParentId?: string | null }[]) => {
      const response = await createAuthenticatedRequest("/api/categories/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("خطا در تغییر ترتیب دسته‌بندی‌ها");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "ترتیب دسته‌بندی‌ها بروزرسانی شد" });
    },
    onError: () => {
      toast({ title: "خطا در تغییر ترتیب", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateMutation.mutate({
      id,
      data: { isActive }
    });
  };

  const handleEditSubmit = () => {
    if (!editingCategory) return;
    updateMutation.mutate({
      id: editingCategory.id,
      data: {
        name: editingCategory.name,
        description: editingCategory.description,
        isActive: editingCategory.isActive,
      },
    });
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
    // Persist to localStorage
    localStorage.setItem('expandedCategories', JSON.stringify(Array.from(newExpanded)));
  };

  const expandAll = () => {
    const allIds = new Set(categories.map(cat => cat.id));
    setExpandedCategories(allIds);
    localStorage.setItem('expandedCategories', JSON.stringify(Array.from(allIds)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
    localStorage.setItem('expandedCategories', JSON.stringify([]));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeIndex = flatCategories.findIndex(cat => cat.id === active.id);
    const overIndex = flatCategories.findIndex(cat => cat.id === over.id);
    
    if (activeIndex === -1 || overIndex === -1) return;

    const activeCategory = flatCategories[activeIndex];
    const overCategory = flatCategories[overIndex];
    
    // Determine new parent and position
    let newParentId = overCategory.parentId;
    let insertPosition = overCategory.order;
    
    // If dropping on a category at the same level, insert after it
    if (activeCategory.level === overCategory.level) {
      newParentId = overCategory.parentId;
      insertPosition = overCategory.order + (activeIndex < overIndex ? 1 : 0);
    } 
    // If dropping on a category at a different level, make it a child
    else if (activeCategory.level < overCategory.level) {
      newParentId = overCategory.id;
      insertPosition = 0;
    }

    // Get all categories with the same parent
    const siblings = categories.filter(cat => cat.parentId === newParentId);
    
    // Generate updates for all affected categories
    const updates: { categoryId: string; newOrder: number; newParentId?: string | null }[] = [];
    
    // Remove active category from siblings temporarily
    const filteredSiblings = siblings.filter(cat => cat.id !== activeCategory.id);
    
    // Sort siblings by current order
    filteredSiblings.sort((a, b) => a.order - b.order);
    
    // Insert active category at new position and reorder all
    let newOrder = 0;
    let inserted = false;
    
    for (const sibling of filteredSiblings) {
      if (!inserted && newOrder === insertPosition) {
        // Insert active category here
        updates.push({
          categoryId: activeCategory.id,
          newOrder,
          newParentId,
        });
        newOrder++;
        inserted = true;
      }
      
      // Update sibling if order changed
      if (sibling.order !== newOrder) {
        updates.push({
          categoryId: sibling.id,
          newOrder,
          newParentId: sibling.parentId,
        });
      }
      newOrder++;
    }
    
    // If not inserted yet, append at end
    if (!inserted) {
      updates.push({
        categoryId: activeCategory.id,
        newOrder,
        newParentId,
      });
    }
    
    // Only mutate if there are actual changes
    if (updates.length > 0) {
      reorderMutation.mutate(updates);
    }
  };

  // Get available parent categories for the form (excluding current category if editing)
  const getAvailableParents = (): Category[] => {
    return categories.filter(cat => 
      editingCategory ? cat.id !== editingCategory.id : true
    );
  };

  return (
    <DashboardLayout title="مدیریت دسته‌بندی‌ها">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* فرم ایجاد دسته‌بندی - سمت راست */}
          <Card data-testid="card-create-category">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                ایجاد دسته‌بندی جدید
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام دسته‌بندی *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="نام دسته‌بندی را وارد کنید"
                    required
                    data-testid="input-category-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">توضیحات</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="توضیحات اختیاری"
                    rows={3}
                    data-testid="textarea-category-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent">دسته‌بندی والد</Label>
                  <Select 
                    value={formData.parentId || "none"} 
                    onValueChange={(value) => setFormData({...formData, parentId: value === "none" ? null : value})}
                  >
                    <SelectTrigger data-testid="select-parent-category">
                      <SelectValue placeholder="انتخاب دسته‌بندی والد (اختیاری)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">هیچ (دسته‌بندی اصلی)</SelectItem>
                      {getAvailableParents().map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createMutation.isPending}
                  data-testid="button-create-category"
                >
                  {createMutation.isPending ? "در حال ایجاد..." : "ایجاد دسته‌بندی"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* لیست درختی دسته‌بندی‌ها - سمت چپ */}
          <Card data-testid="card-categories-tree">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="w-5 h-5" />
                ساختار درختی دسته‌بندی‌ها
              </CardTitle>
              
              {/* Tree Controls */}
              <div className="space-y-3 mt-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="جستجو در دسته‌بندی‌ها..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pr-10"
                    data-testid="input-search-categories"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAll}
                    className="flex-1"
                    data-testid="button-expand-all"
                  >
                    <Expand className="w-4 h-4 ml-1" />
                    باز کردن همه
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAll}
                    className="flex-1"
                    data-testid="button-collapse-all"
                  >
                    <Minimize2 className="w-4 h-4 ml-1" />
                    بستن همه
                  </Button>
                </div>
                
                {searchFilter && (
                  <div className="text-sm text-muted-foreground">
                    {filteredCategories.length} نتیجه برای "{searchFilter}"
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8" data-testid="loading-state">در حال بارگذاری...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground" data-testid="empty-state">
                  هنوز دسته‌بندی ایجاد نشده است
                </div>
              ) : (
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={flatCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1" data-testid="categories-tree">
                      {categoryTree.map((category) => (
                        <SortableCategory
                          key={category.id}
                          category={category}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleActive={handleToggleActive}
                          expandedCategories={expandedCategories}
                          toggleExpanded={toggleExpanded}
                          isPending={updateMutation.isPending}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog برای ویرایش */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>ویرایش دسته‌بندی</DialogTitle>
            </DialogHeader>
            
            {editingCategory && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>نام دسته‌بندی</Label>
                  <Input
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      name: e.target.value
                    })}
                    data-testid="input-edit-category-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>توضیحات</Label>
                  <Textarea
                    value={editingCategory.description || ""}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      description: e.target.value
                    })}
                    rows={3}
                    data-testid="textarea-edit-category-description"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    data-testid="button-cancel-edit"
                  >
                    <X className="w-4 h-4 ml-1" />
                    انصراف
                  </Button>
                  <Button
                    onClick={handleEditSubmit}
                    disabled={updateMutation.isPending}
                    data-testid="button-save-edit"
                  >
                    <Save className="w-4 h-4 ml-1" />
                    {updateMutation.isPending ? "در حال ذخیره..." : "ذخیره"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}