export interface SliderItem {
  id: string
  title: string
  description: string
  image: string
  link: string
  buttonText: string
}

export interface SidebarMenuItem {
  id: string
  label: string
  icon?: string
  link?: string
  children?: SidebarMenuItemChild[]
}

export interface SidebarMenuItemChild {
  id: string
  label: string
  link?: string
  count?: number
}

export interface Category {
  id: string
  name: string
  icon: string
  count: number
}

