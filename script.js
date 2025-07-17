class PromptVariableExpander {
    constructor() {
        this.templateTextarea = document.getElementById('prompt-template');
        this.variablesContainer = document.getElementById('variables-container');
        this.expandedTextarea = document.getElementById('expanded-prompt');
        this.copyButton = document.getElementById('copy-btn');
        this.variableCount = document.getElementById('variable-count');
        
        this.variables = new Map();
        this.variableOrder = [];
        
        this.init();
    }
    
    init() {
        this.templateTextarea.addEventListener('input', () => this.handleTemplateChange());
        this.copyButton.addEventListener('click', () => this.copyToClipboard());
        
        this.handleTemplateChange();
    }
    
    detectVariables(template) {
        const patterns = [
            /\{\{([^}]+)\}\}/g,  // {{variable}}
            /\{([^}]+)\}/g,      // {variable}
            /\$([a-zA-Z_][a-zA-Z0-9_]*)/g  // $variable
        ];
        
        const foundVariables = new Set();
        const variableOrder = [];
        
        patterns.forEach(pattern => {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(template)) !== null) {
                const variable = match[1].trim();
                if (variable && !foundVariables.has(variable)) {
                    foundVariables.add(variable);
                    variableOrder.push({
                        name: variable,
                        position: match.index,
                        fullMatch: match[0]
                    });
                }
            }
        });
        
        variableOrder.sort((a, b) => a.position - b.position);
        
        return variableOrder.map(v => v.name);
    }
    
    handleTemplateChange() {
        const template = this.templateTextarea.value;
        const detectedVariables = this.detectVariables(template);
        
        this.updateVariableCount(detectedVariables.length);
        this.updateVariablesUI(detectedVariables);
        this.updateExpandedPrompt();
    }
    
    updateVariableCount(count) {
        this.variableCount.textContent = `Variables found: ${count}`;
    }
    
    updateVariablesUI(detectedVariables) {
        const currentVariables = new Set(this.variables.keys());
        const newVariables = new Set(detectedVariables);
        
        const variablesToRemove = [...currentVariables].filter(v => !newVariables.has(v));
        const variablesToAdd = detectedVariables.filter(v => !currentVariables.has(v));
        
        variablesToRemove.forEach(variable => {
            this.variables.delete(variable);
        });
        
        variablesToAdd.forEach(variable => {
            this.variables.set(variable, '');
        });
        
        this.variableOrder = detectedVariables;
        this.renderVariablesUI();
    }
    
    renderVariablesUI() {
        if (this.variableOrder.length === 0) {
            this.variablesContainer.innerHTML = `
                <p class="no-variables">
                    No variables detected. Add variables to your template using {{variable}}, {variable}, or $variable format.
                </p>
            `;
            return;
        }
        
        const variablesHTML = this.variableOrder.map(variable => `
            <div class="variable-group animate-in">
                <label class="variable-label" for="var-${variable}">
                    <code>${variable}</code>
                </label>
                <input 
                    type="text" 
                    id="var-${variable}"
                    class="variable-input" 
                    placeholder="Enter value for ${variable}..."
                    value="${this.variables.get(variable) || ''}"
                    data-variable="${variable}"
                />
            </div>
        `).join('');
        
        this.variablesContainer.innerHTML = variablesHTML;
        
        this.variablesContainer.querySelectorAll('.variable-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const variable = e.target.dataset.variable;
                this.variables.set(variable, e.target.value);
                this.updateExpandedPrompt();
            });
        });
    }
    
    updateExpandedPrompt() {
        let expanded = this.templateTextarea.value;
        
        this.variables.forEach((value, variable) => {
            const patterns = [
                new RegExp(`\\{\\{${this.escapeRegex(variable)}\\}\\}`, 'g'),
                new RegExp(`\\{${this.escapeRegex(variable)}\\}`, 'g'),
                new RegExp(`\\$${this.escapeRegex(variable)}\\b`, 'g')
            ];
            
            patterns.forEach(pattern => {
                expanded = expanded.replace(pattern, value || `[${variable}]`);
            });
        });
        
        this.expandedTextarea.value = expanded;
        this.copyButton.disabled = !expanded.trim();
    }
    
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.expandedTextarea.value);
            this.showCopySuccess();
        } catch (err) {
            this.fallbackCopy();
        }
    }
    
    fallbackCopy() {
        this.expandedTextarea.select();
        this.expandedTextarea.setSelectionRange(0, 99999);
        
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard. Please select and copy manually.');
        }
    }
    
    showCopySuccess() {
        const originalText = this.copyButton.textContent;
        const originalClass = this.copyButton.className;
        
        this.copyButton.classList.add('copied');
        this.copyButton.innerHTML = '<span class="copy-icon">✓</span>Copied!';
        
        setTimeout(() => {
            this.copyButton.className = originalClass;
            this.copyButton.innerHTML = '<span class="copy-icon">📋</span>Copy to Clipboard';
        }, 2000);
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        new PromptVariableExpander();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptVariableExpander;
}