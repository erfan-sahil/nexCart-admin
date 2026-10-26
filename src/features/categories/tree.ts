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

export function parentChoices(nodes: CategoryTreeNode[]) {
  const choices: Array<{
    id: string
    name: string
    level: CategoryLevel
    label: string
  }> = []

  const walk = (list: CategoryTreeNode[], trail: string[]) => {
    for (const node of list) {
      const path = [...trail, node.name]

      if (node.level < 3) {
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
