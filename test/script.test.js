const PromptVariableExpander = require('../script.js');

// Mock DOM elements for testing
class MockElement {
    constructor() {
        this.value = '';
        this.textContent = '';
        this.innerHTML = '';
        this.disabled = false;
        this.className = '';
        this.dataset = {};
        this._eventListeners = {};
    }

    addEventListener(event, callback) {
        if (!this._eventListeners[event]) {
            this._eventListeners[event] = [];
        }
        this._eventListeners[event].push(callback);
    }

    dispatchEvent(event) {
        const listeners = this._eventListeners[event.type] || [];
        listeners.forEach(callback => callback(event));
    }

    querySelector() {
        return new MockElement();
    }

    querySelectorAll() {
        return [new MockElement()];
    }

    select() {}
    setSelectionRange() {}
    focus() {}
}

// Mock document
global.document = {
    getElementById: jest.fn(() => new MockElement()),
    execCommand: jest.fn(() => true)
};

// Mock navigator
global.navigator = {
    clipboard: {
        writeText: jest.fn(() => Promise.resolve())
    }
};

// Mock alert
global.alert = jest.fn();

describe('PromptVariableExpander', () => {
    let expander;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Create new instance for each test
        expander = new PromptVariableExpander();
    });

    describe('detectVariables', () => {
        test('should detect double curly brace variables', () => {
            const template = 'Hello {{name}}, welcome to {{platform}}!';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['name', 'platform']);
        });

        test('should detect single curly brace variables', () => {
            const template = 'Your balance is {amount} on {date}';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['amount', 'date']);
        });

        test('should detect dollar sign variables', () => {
            const template = 'User $username has $points points';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['username', 'points']);
        });

        test('should handle mixed variable formats', () => {
            const template = 'Hello {{name}}, your balance is {amount} and user is $username';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['name', 'amount', 'username']);
        });

        test('should preserve order of appearance', () => {
            const template = 'Second {second}, first {{first}}, third $third';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['second', 'first', 'third']);
        });

        test('should handle duplicate variables', () => {
            const template = 'Hello {{name}}, nice to meet you {{name}}!';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['name']);
        });

        test('should handle variables with underscores and numbers', () => {
            const template = 'User {{user_name}} has {account_123} and $var_2';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['user_name', 'account_123', 'var_2']);
        });

        test('should trim whitespace from variables', () => {
            const template = 'Hello {{ name }}, welcome to { platform }!';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['name', 'platform']);
        });

        test('should handle empty template', () => {
            const variables = expander.detectVariables('');
            expect(variables).toEqual([]);
        });

        test('should handle template with no variables', () => {
            const template = 'This is just plain text with no variables.';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual([]);
        });

        test('should handle malformed variables', () => {
            const template = 'This has {unclosed and {{incomplete and $123invalid';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual([]);
        });

        test('should handle nested braces correctly', () => {
            const template = 'This {{outer{inner}}} should work';
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['outer{inner']);
        });
    });

    describe('escapeRegex', () => {
        test('should escape special regex characters', () => {
            expect(expander.escapeRegex('test.value')).toBe('test\\.value');
            expect(expander.escapeRegex('test+value')).toBe('test\\+value');
            expect(expander.escapeRegex('test*value')).toBe('test\\*value');
            expect(expander.escapeRegex('test?value')).toBe('test\\?value');
            expect(expander.escapeRegex('test^value')).toBe('test\\^value');
            expect(expander.escapeRegex('test$value')).toBe('test\\$value');
            expect(expander.escapeRegex('test{value}')).toBe('test\\{value\\}');
            expect(expander.escapeRegex('test(value)')).toBe('test\\(value\\)');
            expect(expander.escapeRegex('test[value]')).toBe('test\\[value\\]');
            expect(expander.escapeRegex('test|value')).toBe('test\\|value');
            expect(expander.escapeRegex('test\\value')).toBe('test\\\\value');
        });

        test('should handle normal strings without change', () => {
            expect(expander.escapeRegex('normalString')).toBe('normalString');
            expect(expander.escapeRegex('test_variable_123')).toBe('test_variable_123');
        });

        test('should handle empty string', () => {
            expect(expander.escapeRegex('')).toBe('');
        });
    });

    describe('updateExpandedPrompt', () => {
        beforeEach(() => {
            // Mock the template textarea value
            expander.templateTextarea = { value: '' };
            expander.expandedTextarea = { value: '' };
            expander.copyButton = { disabled: false };
            expander.variables = new Map();
        });

        test('should expand double curly brace variables', () => {
            expander.templateTextarea.value = 'Hello {{name}}, welcome!';
            expander.variables.set('name', 'John');
            
            expander.updateExpandedPrompt();
            
            expect(expander.expandedTextarea.value).toBe('Hello John, welcome!');
        });

        test('should expand single curly brace variables', () => {
            expander.templateTextarea.value = 'Amount: {value}';
            expander.variables.set('value', '100');
            
            expander.updateExpandedPrompt();
            
            expect(expander.expandedTextarea.value).toBe('Amount: 100');
        });

        test('should expand dollar sign variables', () => {
            expander.templateTextarea.value = 'User: $username';
            expander.variables.set('username', 'alice');
            
            expander.updateExpandedPrompt();
            
            expect(expander.expandedTextarea.value).toBe('User: alice');
        });

        test('should show fallback for empty variables', () => {
            expander.templateTextarea.value = 'Hello {{name}}';
            expander.variables.set('name', '');
            
            expander.updateExpandedPrompt();
            
            expect(expander.expandedTextarea.value).toBe('Hello [name]');
        });

        test('should handle mixed variable types', () => {
            expander.templateTextarea.value = 'Hi {{name}}, balance: {amount}, user: $id';
            expander.variables.set('name', 'John');
            expander.variables.set('amount', '500');
            expander.variables.set('id', 'user123');
            
            expander.updateExpandedPrompt();
            
            expect(expander.expandedTextarea.value).toBe('Hi John, balance: 500, user: user123');
        });

        test('should handle multiple instances of same variable', () => {
            expander.templateTextarea.value = 'Hello {{name}}, goodbye {{name}}';
            expander.variables.set('name', 'Alice');
            
            expander.updateExpandedPrompt();
            
            expect(expander.expandedTextarea.value).toBe('Hello Alice, goodbye Alice');
        });

        test('should escape special characters in variable names', () => {
            expander.templateTextarea.value = 'Value: {{test.value}}';
            expander.variables.set('test.value', 'works');
            
            expander.updateExpandedPrompt();
            
            expect(expander.expandedTextarea.value).toBe('Value: works');
        });

        test('should disable copy button for empty expanded text', () => {
            expander.templateTextarea.value = '';
            
            expander.updateExpandedPrompt();
            
            expect(expander.copyButton.disabled).toBe(true);
        });

        test('should enable copy button for non-empty expanded text', () => {
            expander.templateTextarea.value = 'Some text';
            
            expander.updateExpandedPrompt();
            
            expect(expander.copyButton.disabled).toBe(false);
        });
    });

    describe('updateVariablesUI', () => {
        beforeEach(() => {
            expander.variables = new Map();
            expander.variableOrder = [];
        });

        test('should add new variables', () => {
            const detectedVariables = ['name', 'age'];
            
            expander.updateVariablesUI(detectedVariables);
            
            expect(expander.variables.has('name')).toBe(true);
            expect(expander.variables.has('age')).toBe(true);
            expect(expander.variableOrder).toEqual(['name', 'age']);
        });

        test('should remove variables no longer in template', () => {
            expander.variables.set('oldVar', 'value');
            expander.variables.set('keepVar', 'value');
            
            const detectedVariables = ['keepVar', 'newVar'];
            
            expander.updateVariablesUI(detectedVariables);
            
            expect(expander.variables.has('oldVar')).toBe(false);
            expect(expander.variables.has('keepVar')).toBe(true);
            expect(expander.variables.has('newVar')).toBe(true);
        });

        test('should preserve existing variable values', () => {
            expander.variables.set('name', 'John');
            
            const detectedVariables = ['name', 'age'];
            
            expander.updateVariablesUI(detectedVariables);
            
            expect(expander.variables.get('name')).toBe('John');
            expect(expander.variables.get('age')).toBe('');
        });

        test('should update variable order', () => {
            expander.variableOrder = ['old', 'order'];
            
            const detectedVariables = ['new', 'order'];
            
            expander.updateVariablesUI(detectedVariables);
            
            expect(expander.variableOrder).toEqual(['new', 'order']);
        });
    });

    describe('Integration Tests', () => {
        test('should handle complete workflow with real-world prompt', () => {
            const template = `You are a {{role}} assistant. Help the user with {task} using $approach method.
                             User's name is {{user_name}} and skill level is {skill_level}.`;
            
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['role', 'task', 'approach', 'user_name', 'skill_level']);
            
            // Simulate filling in variables
            expander.templateTextarea = { value: template };
            expander.expandedTextarea = { value: '' };
            expander.copyButton = { disabled: false };
            expander.variables = new Map([
                ['role', 'helpful'],
                ['task', 'coding'],
                ['approach', 'step-by-step'],
                ['user_name', 'Alice'],
                ['skill_level', 'beginner']
            ]);
            
            expander.updateExpandedPrompt();
            
            const expected = `You are a helpful assistant. Help the user with coding using step-by-step method.
                             User's name is Alice and skill level is beginner.`;
            expect(expander.expandedTextarea.value).toBe(expected);
        });

        test('should handle complex template with special characters', () => {
            const template = 'Config: {{api.endpoint}}/users/{user_id}?token=$auth_token';
            
            const variables = expander.detectVariables(template);
            expect(variables).toEqual(['api.endpoint', 'user_id', 'auth_token']);
            
            expander.templateTextarea = { value: template };
            expander.expandedTextarea = { value: '' };
            expander.copyButton = { disabled: false };
            expander.variables = new Map([
                ['api.endpoint', 'https://api.example.com'],
                ['user_id', '12345'],
                ['auth_token', 'abc123']
            ]);
            
            expander.updateExpandedPrompt();
            
            expect(expander.expandedTextarea.value).toBe('Config: https://api.example.com/users/12345?token=abc123');
        });

        test('should handle template with only some variables filled', () => {
            const template = 'Hi {{name}}, your score is {score} and rank is $rank';
            
            expander.templateTextarea = { value: template };
            expander.expandedTextarea = { value: '' };
            expander.copyButton = { disabled: false };
            expander.variables = new Map([
                ['name', 'Bob'],
                ['score', ''],
                ['rank', 'gold']
            ]);
            
            expander.updateExpandedPrompt();
            
            expect(expander.expandedTextarea.value).toBe('Hi Bob, your score is [score] and rank is gold');
        });
    });
});