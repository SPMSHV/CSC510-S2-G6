import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

interface ApiResponse {
  statusCode: number;
  body: any;
}

function httpRequest(method: string, path: string, body?: unknown, token?: string): Promise<ApiResponse> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(data).toString();
    }

    const req = http.request(
      { 
        hostname: 'localhost', 
        port: PORT, 
        path, 
        method, 
        headers 
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = responseBody ? JSON.parse(responseBody) : {};
            resolve({
              statusCode: res.statusCode || 200,
              body: parsed,
            });
          } catch (_e) {
            resolve({
              statusCode: res.statusCode || 200,
              body: responseBody,
            });
          }
        });
      },
    );

    req.on('error', reject);
    if (body) {
      req.write(data);
    }
    req.end();
  });
}

async function waitForServer(maxAttempts = 30, delay = 1000): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await httpRequest('GET', '/health');
      if (response.statusCode === 200) {
         
        console.log('✓ Backend server is ready');
        return;
      }
    } catch (error) {
      // Server not ready yet
    }
     
    console.log(`Waiting for backend server... (${i + 1}/${maxAttempts})`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error('Backend server did not start in time');
}

async function registerVendor(email: string, name: string, password: string): Promise<{ userId: string; token: string }> {
  const response = await httpRequest('POST', '/api/auth/register', {
    email,
    name,
    password,
    role: 'VENDOR',
  });

  if (response.statusCode === 201 || response.statusCode === 409) {
    // If user already exists, try to login
    if (response.statusCode === 409) {
      const loginResponse = await httpRequest('POST', '/api/auth/login', {
        email,
        password,
      });
      if (loginResponse.statusCode === 200) {
        return {
          userId: loginResponse.body.user.id,
          token: loginResponse.body.token,
        };
      }
    } else {
      return {
        userId: response.body.user.id,
        token: response.body.token,
      };
    }
  }
  throw new Error(`Failed to register vendor: ${response.body.error || 'Unknown error'}`);
}

async function createRestaurant(
  token: string,
  name: string,
  description: string,
  location?: { lat: number; lng: number },
): Promise<string> {
  const response = await httpRequest(
    'POST',
    '/api/restaurants',
    {
      name,
      description,
      location,
    },
    token,
  );

  if (response.statusCode === 201 || response.statusCode === 409) {
    return response.body.id;
  }
  throw new Error(`Failed to create restaurant: ${response.body.error || 'Unknown error'}`);
}

async function createMenuItem(
  token: string,
  restaurantId: string,
  name: string,
  price: number,
  description?: string,
  category?: string,
): Promise<void> {
  const response = await httpRequest(
    'POST',
    `/api/restaurants/${restaurantId}/menu`,
    {
      name,
      price,
      description,
      category,
      available: true,
    },
    token,
  );

  if (response.statusCode !== 201) {
     
    console.warn(`Warning: Failed to create menu item ${name}: ${response.body.error || 'Unknown error'}`);
  }
}

async function createRobot(robotId: string, status: string, batteryPercent: number, location: { lat: number; lng: number }): Promise<void> {
  const response = await httpRequest('POST', '/api/robots', {
    robotId,
    status,
    batteryPercent,
    location,
  });

  if (response.statusCode !== 201 && response.statusCode !== 409) {
     
    console.warn(`Warning: Failed to create robot ${robotId}: ${response.body.error || 'Unknown error'}`);
  }
}

async function createStudent(email: string, name: string): Promise<string> {
  const response = await httpRequest('POST', '/api/auth/register', {
    email,
    name,
    password: 'student123',
    role: 'STUDENT',
  });

  if (response.statusCode === 201 || response.statusCode === 409) {
    if (response.statusCode === 409) {
      // User exists, try login to get ID
      const loginResponse = await httpRequest('POST', '/api/auth/login', {
        email,
        password: 'student123',
      });
      if (loginResponse.statusCode === 200) {
        return loginResponse.body.user.id;
      }
    } else {
      return response.body.user.id;
    }
  }
  // If registration fails, return a placeholder
  return 'student-placeholder-id';
}

async function createOrder(
  userId: string,
  vendorId: string,
  items: Array<{ name: string; quantity: number; price: number }>,
  deliveryLocation: string,
  deliveryLocationLat?: number,
  deliveryLocationLng?: number,
): Promise<void> {
  const response = await httpRequest('POST', '/api/orders', {
    userId,
    vendorId,
    items,
    deliveryLocation,
    deliveryLocationLat,
    deliveryLocationLng,
  });

  if (response.statusCode !== 201) {
     
    console.warn(`Warning: Failed to create order: ${response.body.error || 'Unknown error'}`);
  }
}

async function main() {
  try {
     
    console.log('🌱 Starting seed process...');
    
    // Wait for backend to be ready
    await waitForServer();

    // Register vendors and get tokens
     
    console.log('👥 Creating vendors...');
    const pizzaVendor = await registerVendor(
      'pizza@campusbot.edu',
      'Pizza Palace Owner',
      'vendor123',
    );
    const asianVendor = await registerVendor(
      'asian@campusbot.edu',
      'Asian Fusion Owner',
      'vendor123',
    );
    const burgerVendor = await registerVendor(
      'burger@campusbot.edu',
      'Burger Joint Owner',
      'vendor123',
    );
    const cafeVendor = await registerVendor(
      'cafe@campusbot.edu',
      'Campus Cafe Owner',
      'vendor123',
    );
    const tacoVendor = await registerVendor(
      'taco@campusbot.edu',
      'Taco Fiesta Owner',
      'vendor123',
    );
    const medVendor = await registerVendor(
      'mediterranean@campusbot.edu',
      'Mediterranean Express Owner',
      'vendor123',
    );

    // Create restaurants
     
    console.log('🍕 Creating restaurants...');
    
    const pizzaId = await createRestaurant(
      pizzaVendor.token,
      'Pizza Palace',
      'Authentic Italian pizzas and pastas. Fresh ingredients, wood-fired oven, and family recipes passed down for generations.',
      { lat: 35.7871, lng: -78.6701 },
    );

    const asianId = await createRestaurant(
      asianVendor.token,
      'Asian Fusion',
      'A delicious blend of Chinese, Japanese, and Thai cuisines. Fresh ingredients, bold flavors, and quick service.',
      { lat: 35.7881, lng: -78.6711 },
    );

    const burgerId = await createRestaurant(
      burgerVendor.token,
      'Burger Joint',
      'Gourmet burgers, crispy fries, and hand-spun milkshakes. Made fresh to order with premium ingredients.',
      { lat: 35.7861, lng: -78.6691 },
    );

    const cafeId = await createRestaurant(
      cafeVendor.token,
      'Campus Cafe',
      'Fresh coffee, sandwiches, and salads. Your go-to spot for quick breakfast, lunch, or study fuel.',
      { lat: 35.7851, lng: -78.6681 },
    );

    const tacoId = await createRestaurant(
      tacoVendor.token,
      'Taco Fiesta',
      'Authentic Mexican street food. Fresh tortillas, savory fillings, and zesty salsas. ¡Buen provecho!',
      { lat: 35.7841, lng: -78.6671 },
    );

    const medId = await createRestaurant(
      medVendor.token,
      'Mediterranean Express',
      'Fresh Greek and Mediterranean cuisine. Wraps, kebabs, falafel, and healthy options on the go.',
      { lat: 35.7831, lng: -78.6661 },
    );

    // Create menu items for Pizza Palace
     
    console.log('📋 Adding menu items...');
    
    await createMenuItem(pizzaVendor.token, pizzaId, 'Margherita Pizza', 12.99, 'Classic tomato, mozzarella, and fresh basil', 'Pizza');
    await createMenuItem(pizzaVendor.token, pizzaId, 'Pepperoni Pizza', 14.99, 'Tomato sauce, mozzarella, and spicy pepperoni', 'Pizza');
    await createMenuItem(pizzaVendor.token, pizzaId, 'Supreme Pizza', 16.99, 'Pepperoni, sausage, peppers, onions, and mushrooms', 'Pizza');
    await createMenuItem(pizzaVendor.token, pizzaId, 'Fettuccine Alfredo', 13.99, 'Creamy Alfredo sauce with parmesan cheese', 'Pasta');
    await createMenuItem(pizzaVendor.token, pizzaId, 'Spaghetti Marinara', 11.99, 'Classic tomato sauce with garlic and herbs', 'Pasta');
    await createMenuItem(pizzaVendor.token, pizzaId, 'Caesar Salad', 8.99, 'Crisp romaine with Caesar dressing and croutons', 'Salad');
    await createMenuItem(pizzaVendor.token, pizzaId, 'Garlic Bread', 4.99, 'Toasted bread with garlic butter', 'Sides');

    // Create menu items for Asian Fusion
    await createMenuItem(asianVendor.token, asianId, 'General Tso\'s Chicken', 13.99, 'Crispy chicken in sweet and spicy sauce', 'Entrees');
    await createMenuItem(asianVendor.token, asianId, 'Pad Thai', 12.99, 'Stir-fried noodles with shrimp and vegetables', 'Noodles');
    await createMenuItem(asianVendor.token, asianId, 'Chicken Teriyaki Bowl', 11.99, 'Grilled chicken with teriyaki sauce over rice', 'Bowls');
    await createMenuItem(asianVendor.token, asianId, 'Spring Rolls (4)', 5.99, 'Crispy vegetable spring rolls with sweet and sour sauce', 'Appetizers');
    await createMenuItem(asianVendor.token, asianId, 'Sushi Roll - California', 8.99, 'Crab, avocado, and cucumber roll', 'Sushi');
    await createMenuItem(asianVendor.token, asianId, 'Miso Soup', 3.99, 'Traditional Japanese soup with tofu and seaweed', 'Soups');
    await createMenuItem(asianVendor.token, asianId, 'Fried Rice', 9.99, 'Wok-fried rice with vegetables and your choice of protein', 'Rice');

    // Create menu items for Burger Joint
    await createMenuItem(burgerVendor.token, burgerId, 'Classic Cheeseburger', 10.99, 'Angus beef patty, American cheese, lettuce, tomato, onion', 'Burgers');
    await createMenuItem(burgerVendor.token, burgerId, 'Bacon BBQ Burger', 12.99, 'Beef patty, cheddar, crispy bacon, BBQ sauce, onion rings', 'Burgers');
    await createMenuItem(burgerVendor.token, burgerId, 'Veggie Burger', 9.99, 'Plant-based patty with all the fixings', 'Burgers');
    await createMenuItem(burgerVendor.token, burgerId, 'French Fries', 4.99, 'Crispy golden fries', 'Sides');
    await createMenuItem(burgerVendor.token, burgerId, 'Onion Rings', 5.99, 'Beer-battered onion rings', 'Sides');
    await createMenuItem(burgerVendor.token, burgerId, 'Chocolate Milkshake', 5.99, 'Rich and creamy chocolate shake', 'Drinks');
    await createMenuItem(burgerVendor.token, burgerId, 'Vanilla Milkshake', 5.99, 'Classic vanilla shake', 'Drinks');

    // Create menu items for Campus Cafe
    await createMenuItem(cafeVendor.token, cafeId, 'Espresso', 2.99, 'Rich, bold Italian espresso', 'Coffee');
    await createMenuItem(cafeVendor.token, cafeId, 'Cappuccino', 4.99, 'Espresso with steamed milk and foam', 'Coffee');
    await createMenuItem(cafeVendor.token, cafeId, 'Iced Coffee', 3.99, 'Cold brew coffee over ice', 'Coffee');
    await createMenuItem(cafeVendor.token, cafeId, 'Turkey Club Sandwich', 8.99, 'Turkey, bacon, lettuce, tomato, and mayo', 'Sandwiches');
    await createMenuItem(cafeVendor.token, cafeId, 'Veggie Wrap', 7.99, 'Fresh vegetables, hummus, and greens in a wrap', 'Wraps');
    await createMenuItem(cafeVendor.token, cafeId, 'Caesar Salad', 7.99, 'Crisp romaine with Caesar dressing', 'Salads');
    await createMenuItem(cafeVendor.token, cafeId, 'Blueberry Muffin', 3.99, 'Fresh baked muffin with blueberries', 'Pastries');
    await createMenuItem(cafeVendor.token, cafeId, 'Bagel with Cream Cheese', 2.99, 'Fresh bagel with cream cheese', 'Pastries');

    // Create menu items for Taco Fiesta
    await createMenuItem(tacoVendor.token, tacoId, 'Beef Tacos (3)', 9.99, 'Seasoned ground beef with lettuce, cheese, and salsa', 'Tacos');
    await createMenuItem(tacoVendor.token, tacoId, 'Chicken Tacos (3)', 9.99, 'Grilled chicken with cilantro, onion, and lime', 'Tacos');
    await createMenuItem(tacoVendor.token, tacoId, 'Veggie Tacos (3)', 8.99, 'Black beans, corn, and vegetables', 'Tacos');
    await createMenuItem(tacoVendor.token, tacoId, 'Beef Burrito', 10.99, 'Large flour tortilla with beef, rice, beans, and cheese', 'Burritos');
    await createMenuItem(tacoVendor.token, tacoId, 'Chicken Quesadilla', 8.99, 'Flour tortilla with chicken and cheese', 'Quesadillas');
    await createMenuItem(tacoVendor.token, tacoId, 'Guacamole & Chips', 5.99, 'Fresh guacamole with crispy tortilla chips', 'Sides');
    await createMenuItem(tacoVendor.token, tacoId, 'Horchata', 3.99, 'Traditional Mexican rice drink with cinnamon', 'Drinks');

    // Create menu items for Mediterranean Express
    await createMenuItem(medVendor.token, medId, 'Chicken Shawarma Wrap', 9.99, 'Spiced chicken with tahini, vegetables, and garlic sauce', 'Wraps');
    await createMenuItem(medVendor.token, medId, 'Falafel Wrap', 8.99, 'Crispy falafel with hummus and fresh vegetables', 'Wraps');
    await createMenuItem(medVendor.token, medId, 'Lamb Kebab Plate', 12.99, 'Grilled lamb kebab with rice, salad, and pita', 'Plates');
    await createMenuItem(medVendor.token, medId, 'Hummus & Pita', 6.99, 'Creamy hummus with warm pita bread', 'Sides');
    await createMenuItem(medVendor.token, medId, 'Greek Salad', 8.99, 'Fresh vegetables with feta cheese and olives', 'Salads');
    await createMenuItem(medVendor.token, medId, 'Baklava', 4.99, 'Sweet pastry with honey and nuts', 'Desserts');

    // Create robots
     
    console.log('🤖 Creating robots...');
    await createRobot('RB-01', 'IDLE', 95, { lat: 35.7871, lng: -78.6701 });
    await createRobot('RB-02', 'IDLE', 88, { lat: 35.7881, lng: -78.6711 });
    await createRobot('RB-03', 'CHARGING', 45, { lat: 35.7861, lng: -78.6691 });

    // Create a student for sample orders
     
    console.log('👨‍🎓 Creating sample student...');
    const studentId = await createStudent('student@university.edu', 'Student One');

    // Create sample orders
     
    console.log('📦 Creating sample orders...');
    await createOrder(
      studentId,
      pizzaVendor.userId,
      [
        { name: 'Margherita Pizza', quantity: 1, price: 12.99 },
        { name: 'Garlic Bread', quantity: 1, price: 4.99 },
      ],
      'Engineering Building, Room 201',
      35.7871,
      -78.6701,
    );

    await createOrder(
      studentId,
      cafeVendor.userId,
      [
        { name: 'Turkey Club Sandwich', quantity: 1, price: 8.99 },
        { name: 'Iced Coffee', quantity: 1, price: 3.99 },
      ],
      'Library, Study Room 305',
      35.7851,
      -78.6681,
    );

     
    console.log('✅ Seed complete!');
     
    console.log(`\n📊 Summary:`);
     
    console.log(`   - 6 Restaurants created`);
     
    console.log(`   - Multiple menu items per restaurant`);
     
    console.log(`   - 3 Robots created`);
     
    console.log(`   - 1 Student account created`);
     
    console.log(`   - 2 Sample orders created`);
     
    console.log(`\n🌐 Visit http://localhost:${PORT}/api-docs to view API documentation`);
     
    console.log(`\n💡 All vendors use password: vendor123`);
     
    console.log(`💡 Student uses password: student123`);
  } catch (error) {
     
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
