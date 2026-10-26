import { categoryLevelTitle } from "./labels"
import type { Category, CategoryLevel, CategoryTreeNode } from "./types"

export function flattenCategories(nodes: CategoryTreeNode[]) {
  const items: Category[] = []

  const walk = (list: CategoryTreeNode[]) => {
    for (const node of list) {
      const { children, ...category } = node
      items.push(category)
      walk(children)
    }
  }

  walk(nodes)
  return items
}

function findCategory(
  nodes: CategoryTreeNode[],
  id: string
): CategoryTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node
    }

    const child = findCategory(node.children, id)

    if (child) {
      return child
    }
  }

  return null
}

export function categoryHasChildren(nodes: CategoryTreeNode[], id: string) {
  return (findCategory(nodes, id)?.children.length ?? 0) > 0
}

function excludedParentIds(nodes: CategoryTreeNode[], excludeId?: string) {
  const excluded = new Set<string>()

  if (!excludeId) {
    return excluded
  }

  const category = findCategory(nodes, excludeId)

  const collect = (node: CategoryTreeNode) => {
    excluded.add(node.id)
    node.children.forEach(collect)
  }

  if (category) {
    collect(category)
  } else {
    excluded.add(excludeId)
  }

  return excluded
}

export type CategoryTreeFilter = {
  search: string
  level: CategoryLevel | ""
  status: "active" | "inactive" | ""
}

function normalizedSearch(search: string) {
  return search.trim().toLowerCase()
}

function textMatches(category: Category, search: string) {
  if (!search) {
    return true
  }

  return `${category.name} ${category.slug}`.toLowerCase().includes(search)
}

function passesConstraints(category: Category, filter: CategoryTreeFilter) {
  if (filter.level && category.level !== filter.level) {
    return false
  }

  if (filter.status === "active") {
    return category.isActive
  }

  if (filter.status === "inactive") {
    return !category.isActive
  }

  return true
}

function constrainTree(nodes: CategoryTreeNode[], filter: CategoryTreeFilter) {
  const next: CategoryTreeNode[] = []

  for (const node of nodes) {
    const children = constrainTree(node.children, filter)

    if (passesConstraints(node, filter) || children.length > 0) {
      next.push({ ...node, children })
    }
  }

  return next
}

export function filterCategoryTree(
  nodes: CategoryTreeNode[],
  filter: CategoryTreeFilter
) {
  const search = normalizedSearch(filter.search)

  if (!search && !filter.level && !filter.status) {
    return nodes
  }

  const walk = (list: CategoryTreeNode[]) => {
    const next: CategoryTreeNode[] = []

    for (const node of list) {
      const searchHit =
        Boolean(search) &&
        textMatches(node, search) &&
        passesConstraints(node, filter)

      if (searchHit) {
        next.push({
          ...node,
          children: constrainTree(node.children, filter),
        })
        continue
      }

      const children = walk(node.children)

      if ((!search && passesConstraints(node, filter)) || children.length > 0) {
        next.push({ ...node, children })
      }
    }

    return next
  }

  return walk(nodes)
}

export function countMatchingCategories(
  nodes: CategoryTreeNode[],
  filter: CategoryTreeFilter
) {
  const search = normalizedSearch(filter.search)

  return flattenCategories(nodes).filter((category) => {
    if (search && !textMatches(category, search)) {
      return false
    }

    return passesConstraints(category, filter)
  }).length
}

export function categoryChildCounts(nodes: CategoryTreeNode[]) {
  const counts = new Map<string, number>()

  const walk = (list: CategoryTreeNode[]) => {
    for (const node of list) {
      counts.set(node.id, node.children.length)
      walk(node.children)
    }
  }

  walk(nodes)
  return counts
}

export function categoryBranchIds(nodes: CategoryTreeNode[]) {
  const ids: string[] = []

  const walk = (list: CategoryTreeNode[]) => {
    for (const node of list) {
      if (node.children.length > 0) {
        ids.push(node.id)
        walk(node.children)
      }
    }
  }

  walk(nodes)
  return ids
}

export function parentChoices(nodes: CategoryTreeNode[], excludeId?: string) {
  const excluded = excludedParentIds(nodes, excludeId)
  const choices: Array<{
    id: string
    name: string
    level: CategoryLevel
    label: string
  }> = []

  const walk = (list: CategoryTreeNode[], trail: string[]) => {
    for (const node of list) {
      const path = [...trail, node.name]

      if (node.level < 3 && !excluded.has(node.id)) {
        choices.push({
          id: node.id,
          name: node.name,
          level: node.level,
          label: `${categoryLevelTitle(node.level)} · ${path.join(" / ")}`,
        })
      }

      walk(node.children, path)
    }
  }

  walk(nodes, [])
  return choices
}
