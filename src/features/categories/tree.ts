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
          label: path.join(" / "),
        })
      }

      walk(node.children, path)
    }
  }

  walk(nodes, [])
  return choices
}
