import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { fallback: ReactNode; children: ReactNode }
type State = { err: boolean }

/**
 * Catches useGLTF / parse failures so we can fall back to procedural meshes offline.
 */
export class ModelErrorBoundary extends Component<Props, State> {
  state: State = { err: false }

  static getDerivedStateFromError(): State {
    return { err: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    void error
    void info
  }

  render(): ReactNode {
    if (this.state.err) {
      return this.props.fallback
    }
    return this.props.children
  }
}
