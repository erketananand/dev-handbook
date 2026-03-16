### Step 1: Clarify Requirements

Understand the **requirements** and **use-cases** by asking below questions:

* What are the **core features** we need to support?
* Are there any specific features we should **prioritize**?
* Who are the **primary users** of this system?
* What **actions** can users take?
* Are there any specific **constraints** or **limitations**?
* Do we need to handle **concurrency**?
* Do we need to handle **errors**, **edge cases**, **exceptions**, and **unexpected input**?

### Step 2: Identify Entities

* Break down the problem and identify the **core entities** or **objects** by visualizing the system by going from outside to inside of the system to figure out different entities.
* Core entities are the key objects or concepts around which your system is built.
* These entities will become the classes in your object-oriented design. Think of them as the nouns in the problem description.

### Step 3: Class / UML Diagram

Design the **classes**, **enums** and **interfaces** that will represent the entities in your system.

* **3.1 Define classes and relationships**
  * Translate entities into classes and come up with a **list of attributes** you want to have in those classes.
  * If your design consists of multiple classes, figure out how would they would relate with each other
    * **Generalization**: A implements B
    * **Inheritance**: A inherits from B (A "is-a" B)
    * **Association**:
      * **Uni-directional Association**: A can call B, but not vice versa
      * **Bi-directional Association**: A and B can call each other
    * **Aggreation**: A "has-an" instance of B. B can exist without A.
    * **Composition**: A "has-an" instance of B. B can't esist without A.
   
* **3.2 Define interfaces and core methods**
  * Define interfaces and core methods in each of the classes which will encapsulate the actions or behaviors for those classes.
   
* **3.3 Define a central class**
  * This simplifies the API and makes it easier to use and understand the system as a whole.
  * This will serve as the central coordinator for the entire system. It manages the creation, retrieval, and interaction of all major components.

### Step 4: Design the DB Schema

* For each class that represents an entity in the class diagram, create a table in the schema design.
* For each primitive attribute (int/boolean/string) in each entity class, put that attribute as a column in the corresponding table (non-object & non-associative attribute)
* For every non-primitive attribute (relation with another class)
  * Find the cardinality of the relation
  * Represent that relation as per rules to represent that cardinality.
* Inheritance is not represented by multiple tables with the same attributes. Instead, one table with common attributes and other tables with specific attributes and foreign keys.



### Step 5: Write a working code

* Project Structure (your code base should be structured as per the best practice in the industry). EX: MVC architecture
* At least some of the requirements must be running end to end.
* Code all the models (classes in the class diagram) first.
* Go requirement by requirement in any order. The most preferable requirement should be an independent one or an easy one than others. Try to build the main core feature then go with other features by checking with the interviewer to understand which functionalities are important for the interview.
* While implementing requirements, implement each class/interface needed to satisfy that requirement.
* If the expectation is to demo and test the code, you can create a **separate demo class**.
* Best Coding Practices:
  * Use **meaningful names** for **classes**, **methods**, and **variables**.
  * Focus on simplicity and readability.
  * Favor **composition over inheritance** to promote flexibility and avoid tight coupling.
  * Avoid duplicating code or logic.
  * Use **interfaces** to define contracts and enable loose coupling between components.
  * Only implement what is required.
  * Strive for modularity and separation of concerns to make the codebase maintainable and scalable.
  * Apply **design principles** and **design patterns** wherever necessary.
  * Make your code scalable so that it performs well with large data sets.

### Step 6: Exception Handling

Handle **errors**, **edge cases**, **exceptions**, and **unexpected input**.

> NOTE: You may skip some of these due to limited time in interviews. It’s always a good idea to check with the interviewer on what all is expected from the design.
